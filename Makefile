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


