# Stage 1: Building the app
FROM node:14.15.2-alpine as builder

# Set the working directory
WORKDIR /app

# Install build dependencies (required for some npm packages)
RUN apk add --no-cache python2 make g++

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install dependencies including 'devDependencies'
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Run the app
FROM node:14.15.2-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and other necessary files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the compiled code from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the app
CMD ["node", "dist/index.js"]
