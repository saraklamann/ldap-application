# Usa imagem oficial do Node
FROM node:18

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do projeto (incluindo src/)
COPY . .

# Define o comando para rodar o app (ajuste se precisar)
CMD ["npm", "run", "start", "--", "forever"]
