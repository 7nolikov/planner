.PHONY: dev build preview install clean deploy

# Development server
dev:
	npm run dev

# Production build
build:
	npm run build

# Preview production build
preview:
	npm run preview

# Install dependencies
install:
	npm install

# Clean build artifacts
clean:
	if exist dist rmdir /s /q dist
	if exist node_modules rmdir /s /q node_modules

# Deploy to GitHub Pages (run after build)
deploy: build
	@echo "Build complete. Push to GitHub to trigger deployment."

