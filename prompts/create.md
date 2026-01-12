# Prompt

Gere um sistema COMPLETO para gestão de condomínios com REST API usando Node.js, Express.js e banco de dados MySQL. 

O frontend deve ser feito usando React.js e Tailwind CSS, com visual premium, moderno e elegante, em tons de azul, no padrão SaaS, e também deve ser mobile-first.

O sistema será hospedado na Vercel e deve seguir a seguinte estrutura de pastas:
- /api (arquivos da API)
- /public (arquivos do frontend)

O sistema deve conter:

1 - Página de login

- Email e senha
- Botão "Entrar"
- Link para cadastro 
- Link para esqueci a senha

2 - Página de 

- Nome, Email, telefone e senha
- Botão "Cadastrar"
- Link para login

3 - Gerenciamento (CRUD) de moradores

Dados do morador:
- Nome (string)
- Email (string)
- Telefone (string)
- Unidade (select de unidades)
Deve ter listagem de moradores
Deve ter cadastro de moradores
Deve ter exclusão de moradores

4 - Gerenciamento (CRUD) de unidades

Dados da unidade:
- Quadra (string)
- Lote (integer)
- Casa (integer)
- Observação (string)
Página de listagem de unidades
- deve ter filtro de unidades (quadra, lote, casa)
- deve ter paginação de unidades
- deve conter um botão para cadastrar nova unidade
- o item da lista deve ser clicavel para visualizar os detalhes da unidade
Página de visualização de detalhes da unidade
- Deve listar os moradores vinculados a unidade
- Deve conter um botão para editar a unidade
- Deve conter um botão para excluir a unidade

5 - Gerenciamento (CRUD) de fluxo de caixa

Dados do fluxo de caixa:
- Data (date)
- Tipo (entrada/saída)
- Valor (decimal)
- Upload de comprovante (arquivo pdf ou imagem)
- Descrição (string)
- Unidade (select de unidades, opcional)
Deve ter listagem de fluxo de caixa
- deve ter filtro de fluxo de caixa (tipo, data, unidade)
- deve ter paginação de fluxo de caixa
- deve conter um botão para cadastrar novo fluxo de caixa
- o item da lista deve ser clicavel para visualizar os detalhes do fluxo de caixa
Página de visualização de detalhes do fluxo de caixa
- Deve listar os detalhes do fluxo de caixa
- Deve conter um frame para visualizar o comprovante (pdf ou imagem)
- Deve conter um botão para editar o fluxo de caixa
- Deve conter um botão para excluir o fluxo de caixa

6 - REGRAS DE ACESSO

O sistema dev conter dois níveis de acesso:
- admin
- morador
O "admin" deve ter acesso a todas as funcionalidades do sistema

O "morador" deve ter acesso as funcionalidades de:
- Editar seus dados
- Visualizar a qual unidade ele está vinculado
- Visualizar seus fluxos de caixa, vinculados a sua unidade e sem vinculos, somente
- Conseguir registrar um pagamento somente do tipo entrada (fluxo de caixa)
- Conseguir visualizar os detalhes do fluxo de caixa
- Conseguir editar o fluxo de caixa somente que ele gerou
- Não deve conseguir excluir nada

7 - TABELA MYSQL (CRIE migrations)

Crie as migrations para as tabelas:
- users
- units
- payments

8 - VISUAL (important!)

- Tema Tailwind
- Tons de azul premium (#0ea5e9, #1e3a8a, #0b1726, #1d4ed8)
- Design clean, moderno, estilo SaaS
- Cards arredondados
- Sombra suave
- Animações microinteractions

9 - ENTREGA FINAL

Quero tudo:
- Código completo
- Todo o código deve ser feito em ingles, sem comentarios em portugues
- Deve conter um arquivo de tradução para portugues
- Estrutura de pastas
- Arquitetura final
- Instruções de instalação (README)
- Todos os endpoints
- Banco de dados (migrations)
- Frontend (React.js, Tailwind CSS)
- Backend (Node.js, Express.js)
- Hospedagem (Vercel)

Gerar tudo em um único projeto organizado.