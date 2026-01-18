const PostRepository = require('../repositories/PostRepository');
const { logAction } = require('../utils/logger');
const NotificationService = require('./NotificationService');

class PostService {
    async findAll(options, userId, userRole, userUnitId) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        
        const total = await PostRepository.count(options, userId, userRole, userUnitId);
        const rows = await PostRepository.findAll(options, userId, userRole, userUnitId);

        return {
            data: rows,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit)
            }
        };
    }

    async findById(id, userId, userRole, userUnitId) {
        const post = await PostRepository.findById(id);
        if (!post) return null;

        // Visual visibility check (though repo filters list, direct access needs check)
        if (userRole !== 'admin') {
            const isPublic = !post.unit_id;
            const isMyUnit = userUnitId && post.unit_id === userUnitId;
            if (!isPublic && !isMyUnit) {
                throw new Error("Unauthorized");
            }
        }

        // Record read
        if (userId) {
            await PostRepository.recordRead(id, userId);
        }

        // If admin, get readers list
        if (userRole === 'admin') {
            post.readers = await PostRepository.getReaders(id);
        }

        return post;
    }

    async create(data, requesterId, userRole, ip, reqPushEndpoint = null) {
        if (userRole !== 'admin') {
            throw new Error("Unauthorized");
        }
        
        const { category, title, content, file, unit_id } = data;
        const id = await PostRepository.create({ category, title, content, file, unit_id });
        
        const logData = { category, title, unit_id };
        await logAction(requesterId, 'CREATE', 'post', id, logData, ip);
        
        // Notify residents
        NotificationService.notifyNewPost({ id, title, unit_id }, requesterId, reqPushEndpoint).catch(err => {
            console.error('Failed to send post notifications:', err);
        });
        
        return id;
    }

    async update(id, data, requesterId, userRole, ip) {
        if (userRole !== 'admin') {
            throw new Error("Unauthorized");
        }

        const oldData = await PostRepository.findById(id);
        if (!oldData) throw new Error("Post not found");

        const { category, title, content, file, unit_id } = data;
        await PostRepository.update(id, { category, title, content, file, unit_id });

        const newData = { category, title, unit_id };
        await logAction(requesterId, 'UPDATE', 'post', id, { old: oldData, new: newData }, ip);
    }

    async delete(id, requesterId, userRole, ip) {
        if (userRole !== 'admin') {
            throw new Error("Unauthorized");
        }
        
        const deletedData = await PostRepository.findById(id);
        if (!deletedData) throw new Error("Post not found");

        await PostRepository.delete(id);
        await logAction(requesterId, 'DELETE', 'post', id, deletedData, ip);
    }
}

module.exports = new PostService();
