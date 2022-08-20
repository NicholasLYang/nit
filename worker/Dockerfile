FROM node:18
COPY package*.json ./
RUN npm install
COPY src/ src/
COPY rust-analyzer-aarch64-apple-darwin rust-analyzer
RUN chmod +x rust-analyzer
RUN npm run build
CMD ["node", "bundle.js"]
