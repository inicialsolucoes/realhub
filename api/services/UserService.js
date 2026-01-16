const UserRepository = require('../repositories/UserRepository');
const PasswordResetRepository = require('../repositories/PasswordResetRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logAction } = require('../utils/logger');
const { sendResetEmail } = require('../utils/mailer');

class UserService {
    async register(data, ip) {
        // ... method unchanged ...
        const { name, email, password, phone } = data;
        if (!name || !email || !password) {
            throw new Error('Missing required fields');
        }

        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            const error = new Error('Email already in use!');
            error.code = 'ER_DUP_ENTRY';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const userId = await UserRepository.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'user'
        });

        await logAction(userId, 'REGISTER', 'user', userId, { name, email }, ip);

        return { message: 'User registered successfully!', userId };
    }

    async login(email, password, ip) {
        // ... method unchanged ...
         const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found.');
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            throw new Error('Invalid Password!');
        }

        if (user.role === 'user' && !user.unit_id) {
            throw new Error('Acesso negado. Sua conta ainda não possui uma unidade vinculada. Entre em contato com a administração.');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, unit_id: user.unit_id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: 86400 } // 24 hours
        );

        await logAction(user.id, 'LOGIN', 'user', user.id, { email: user.email }, ip);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            unit_id: user.unit_id,
            accessToken: token
        };
    }

    async forgotPassword(email, ip) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            return { message: 'Se existir uma conta com este email, as instruções foram enviadas.' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(token, 8);

        await PasswordResetRepository.create(email, hashedToken);
        await sendResetEmail(email, token);

        await logAction(user.id, 'FORGOT_PASSWORD_REQUEST', 'user', user.id, { email }, ip);

        return { message: 'Se existir uma conta com este email, as instruções foram enviadas.' };
    }

    async resetPassword(token, password, ip) {
        const resets = await PasswordResetRepository.findActiveTokens();
        
        let validReset = null;
        for (const reset of resets) {
            const isMatch = await bcrypt.compare(token, reset.token);
            if (isMatch) {
                validReset = reset;
                break;
            }
        }

        if (!validReset) {
            throw new Error('Token inválido ou expirado.');
        }

        const user = await UserRepository.findByEmail(validReset.email);
        if (!user) {
             throw new Error('User not found.');
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await UserRepository.update(user.id, { password: hashedPassword });
        
        await PasswordResetRepository.deleteByEmail(validReset.email);

        await logAction(user.id, 'PASSWORD_RESET', 'user', user.id, { email: user.email }, ip);

        return { message: 'Senha alterada com sucesso!' };
    }

    async findAll(options) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;

        const total = await UserRepository.count(options);
        const rows = await UserRepository.findAll(options);

        // Formatting logic could be here if needed for 'meta'
        return {
            data: rows,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit)
            }
        };
    }

    async findById(id) {
        const user = await UserRepository.findById(id);
        if (user) {
            user.cost_center_ids = await UserRepository.getLinkedCostCenters(id);
        }
        return user;
    }

    async createUser(data, adminId, ip) {
        const { name, email, password, phone, role, unit_id, cost_center_ids } = data;
        const hashedPassword = await bcrypt.hash(password, 8);
        
        const existingUser = await UserRepository.findByEmail(email);
         if (existingUser) {
            const error = new Error('Email already in use!');
            error.code = 'ER_DUP_ENTRY';
            throw error;
        }

        const userId = await UserRepository.create({
            name, email, password: hashedPassword, phone, role: role || 'user', unit_id
        });

        if (cost_center_ids && Array.isArray(cost_center_ids)) {
            for (const ccId of cost_center_ids) {
                await UserRepository.addLinkedCostCenter(userId, ccId);
            }
        }

        const logData = { name, email, phone, role: role || 'user', unit_id, cost_center_ids };
        await logAction(adminId, 'CREATE', 'user', userId, logData, ip);

        return userId;
    }

    async updateUser(id, data, requesterId, requesterRole, ip) {
        const { name, email, phone, role, unit_id, cost_center_ids } = data;
        const currentData = await UserRepository.findById(id);
        
        if (!currentData) throw new Error("User not found");

        const updateData = { name, email, phone };
        
        if (requesterRole === 'admin') {
            if (role) updateData.role = role;
            if (unit_id !== undefined) updateData.unit_id = unit_id;
        }

        await UserRepository.update(id, updateData);

        if (requesterRole === 'admin' && cost_center_ids !== undefined && Array.isArray(cost_center_ids)) {
            await UserRepository.clearLinkedCostCenters(id);
            for (const ccId of cost_center_ids) {
                await UserRepository.addLinkedCostCenter(id, ccId);
            }
        }

        const newDataForLog = {
            name: name || currentData.name,
            email: email || currentData.email,
            phone: phone || currentData.phone,
            role: role || currentData.role,
            unit_id: unit_id !== undefined ? unit_id : currentData.unit_id,
            cost_center_ids: cost_center_ids
        };

        const oldDataForLog = {
             name: currentData.name,
             email: currentData.email,
             phone: currentData.phone,
             role: currentData.role,
             unit_id: currentData.unit_id,
        };

        await logAction(requesterId, 'UPDATE', 'user', id, { old: oldDataForLog, new: newDataForLog }, ip);
    }

    async deleteUser(id, requesterId, ip) {
        const deletedData = await UserRepository.findById(id);
        if (!deletedData) throw new Error("User not found");

        await UserRepository.delete(id);
        await logAction(requesterId, 'DELETE', 'user', id, deletedData, ip);
    }

    async logout(userId, ip) {
        await logAction(userId, 'LOGOUT', 'user', userId, null, ip);
    }
}

module.exports = new UserService();
