# Use Node.js 20
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Expose the port (Gradio/HF default is 7860)
ENV PORT=7860
EXPOSE 7860

# Start the application
CMD ["node", "server.js"]
