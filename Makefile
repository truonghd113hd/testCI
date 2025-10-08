pm2-start:
	# yarn typeorm migration:run -d datasource.ts
	yarn build && pm2 start ecosystem.config.js --env production

pm2-cron-start:
	# yarn typeorm migration:run -d datasource.ts
	yarn build && pm2 start pm2.cron.config.js --env production

pm2-restart:
	pm2 restart ecosystem.config.js --env production

docker-local-up:
	docker compose -f  docker/docker-compose.local.yml up -d

docker-local-down:
	docker compose -f  docker/docker-compose.local.yml down

docker-local-down-v:
	docker compose -f  docker/docker-compose.local.yml down -v

# K6 Load Testing Commands
k6-setup: ## Setup k6 testing environment
	docker-compose -f docker/docker-compose.yml up -d influxdb grafana
	sleep 10
	curl -i -XPOST 'http://localhost:8086/query' --data-urlencode "q=CREATE DATABASE k6" || true

k6-local: ## Run local k6 test
	npm run k6:advanced

k6-ci: ## Run CI-optimized k6 test
	TEST_MODE=safe npm run k6:ci

k6-cloud: ## Run k6 test on cloud
	npm run k6:cloud

k6-clean: ## Clean up k6 environment
	docker-compose -f docker/docker-compose.yml down
	rm -f k6-results.json

# CI Caching Commands
cache-clear-local: ## Clear local Docker cache
	docker system prune -f
	docker volume prune -f

cache-prebuild: ## Pre-build Docker images for caching
	docker compose -f docker/docker-compose.local.yml pull
	docker compose -f docker/docker-compose.local.yml build

cache-test: ## Test CI workflow with cache simulation
	@echo "Simulating CI cache workflow..."
	npm ci
	docker compose -f docker/docker-compose.local.yml up -d
	sleep 15
	npm run build:prod || npm run build
	npm run k6:ci
	docker compose -f docker/docker-compose.local.yml down

k6-test-ci: ## Run complete k6 CI test simulation
	$(MAKE) cache-prebuild
	$(MAKE) cache-test

docker-local-config:
	docker compose -f  docker/docker-compose.local.yml config

docker-prod-up:
	docker compose -f  docker/docker-compose.prod.yml up -d

docker-prod-down:
	docker compose -f  docker/docker-compose.prod.yml down

docker-prod-down-v:
	docker compose -f  docker/docker-compose.prod.yml down -v

docker-prod-config:
	docker compose -f  docker/docker-compose.prod.yml config

typeorm-migration-create:
	yarn typeorm migration:create src/migrations/$(name)

typeorm-migration-generate:
	yarn typeorm migration:generate src/migrations/$(name) -d datasource.ts

typeorm-migration-revert:
	yarn typeorm migration:revert -d datasource.ts

typeorm-migration-run:
	yarn typeorm migration:run  -d datasource.ts

typeorm-schema-sync:
	yarn typeorm schema:sync -d datasource.ts
	
typeorm-entity-create:
	yarn typeorm entity:create  src/modules/${name}/entities/${name}.entity

typeorm-seeder-run:
	yarn seed:run src/seeding/seeder.ts

module-create:
	yarn nest g module modules/${name}
	yarn nest g controller modules/${name} --no-spec
	yarn nest g service modules/${name} --no-spec
	yarn nest g class modules/${name}/entities/${name}.entity --no-spec --flat
	yarn nest g class modules/${name}/dtos/${name}-response.dto --no-spec --flat
	yarn nest g class modules/${name}/dtos/${name}-request.dto --no-spec --flat
eslint:
	npx eslint "{src,apps,libs,test}/**/*.ts" --fix
worker:
	yarn worker


