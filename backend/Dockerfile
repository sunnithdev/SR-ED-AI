# 1. Use official Node image
FROM node:20-alpine

# 2. Create app directory inside container
WORKDIR /app

# 3. Copy only package files first (for faster Docker cache)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy the rest of the code
COPY . .

# 6. Build (if you use TypeScript or build step)
# If you just run plain JS, delete this line
RUN npm run build

# 7. Expose the port your app listens on
EXPOSE 4000

# 8. Start command
# Adjust if your start script is different
CMD ["npm", "start"]
