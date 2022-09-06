FROM node:18
COPY package*.json ./
RUN npm install
COPY src/ src/
RUN npm run build
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN apt-get update && apt-get install cmake -y
CMD ["node", "bundle.js"]
