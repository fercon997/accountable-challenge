FROM node:20

# Set Docker as a non-root user
USER node

# Create app folder
WORKDIR /app

# Set to dev environment
ENV NODE_ENV development


# Copy source code into app folder
COPY --chown=node:node . .

# Install dependencies
RUN npm i
