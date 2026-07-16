# Use an official Node runtime as a parent image
FROM node:18-bullseye

# Install Python 3 and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Symlink python to python3 so the Next.js app can call 'python'
RUN ln -s /usr/bin/python3 /usr/bin/python || true

# Set the working directory
WORKDIR /app

# Install Python ML dependencies directly via pip3
RUN pip3 install pandas numpy catboost scikit-learn

# Copy package.json and install Node dependencies
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose port 7860 (Required by Hugging Face Spaces, also works for Render)
EXPOSE 7860

# Next.js will default to port 3000, we force it to 7860
ENV PORT=7860

# Next.js will automatically use the PORT environment variable we set above
CMD ["pnpm", "start"]
