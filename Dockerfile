FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 构建 Next.js 项目
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]