# CI Caching Optimizations for k6 Testing

## Overview

This document describes the caching strategies implemented in our GitHub Actions CI workflow to improve k6 testing performance and reduce CI execution time.

## Implemented Caching Strategies

### 1. Node.js Dependencies Caching
```yaml
uses: actions/setup-node@v4
with:
  node-version: 20
  cache: 'npm'
```
- **Purpose**: Cache `node_modules` and npm cache
- **Benefit**: Faster `npm ci` execution (~30-60s savings)
- **Cache Key**: Automatically managed by GitHub Actions based on `package-lock.json`

### 2. k6 Binary Caching
```yaml
- name: Cache k6 binary
  id: cache-k6
  uses: actions/cache@v4
  with:
    path: ~/.cache/k6
    key: ${{ runner.os }}-k6-binary-v1
```
- **Purpose**: Cache the k6 binary to avoid downloading/installing on every run
- **Benefit**: Save ~10-15s per CI run
- **Cache Key**: Based on runner OS with version identifier

### 3. Docker Layer Caching
```yaml
- name: Cache Docker layers
  uses: actions/cache@v4
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
```
- **Purpose**: Cache Docker image layers for faster service startup
- **Benefit**: Faster PostgreSQL, Redis, InfluxDB container startup (~20-30s savings)
- **Cache Key**: Based on commit SHA with OS fallback

### 4. Test Database Setup Caching
```yaml
- name: Cache test database setup
  id: cache-db
  uses: actions/cache@v4
  with:
    path: /tmp/db-setup-done
    key: ${{ runner.os }}-db-setup-${{ hashFiles('docker/test-data.sql') }}
```
- **Purpose**: Skip database setup if test data hasn't changed
- **Benefit**: Save ~5-10s when test data is unchanged
- **Cache Key**: Hash of test data SQL file

### 5. Application Build Caching
```yaml
- name: Cache app build
  uses: actions/cache@v4
  with:
    path: |
      dist
      node_modules/.cache
    key: ${{ runner.os }}-app-build-${{ github.sha }}
```
- **Purpose**: Cache compiled application and build artifacts
- **Benefit**: Faster application startup for testing
- **Cache Key**: Based on commit SHA

## Performance Improvements

### Before Optimization
- Total k6 test job time: ~8-12 minutes
- Dependencies installation: ~45-60s
- Docker services startup: ~30-45s
- k6 installation: ~10-15s
- Database setup: ~15-20s

### After Optimization (Expected)
- Total k6 test job time: ~4-6 minutes (40-50% improvement)
- Dependencies installation: ~10-15s (cached)
- Docker services startup: ~15-20s (cached layers)
- k6 installation: ~2-3s (cached binary)
- Database setup: ~2-3s (cached when unchanged)

## Cache Management

### Cache Keys Strategy
- **Stable keys**: For binaries and tools that don't change often (k6)
- **Content-based keys**: For files that change based on content (package.json, test data)
- **Commit-based keys**: For build artifacts tied to specific code versions

### Cache Invalidation
- Node dependencies: Auto-invalidated when `package-lock.json` changes
- k6 binary: Manually versioned (update key when k6 version changes)
- Docker layers: Invalidated on each commit (ensures fresh builds)
- Database setup: Invalidated when test data changes
- App build: Invalidated on each commit

## Monitoring Cache Effectiveness

### Check cache hit rates in CI logs:
```
Cache restored from key: linux-npm-deps-abc123
Cache saved with key: linux-k6-binary-v1
```

### Expected cache hit rates:
- Node dependencies: ~80-90% (only miss on package.json changes)
- k6 binary: ~95% (rarely updated)
- Docker layers: ~50-70% (depends on base image updates)
- Database setup: ~70-80% (only miss on test data changes)

## Best Practices

### 1. Monitor Cache Size
- GitHub Actions has 10GB cache limit per repository
- Regularly clean up old cache entries
- Use appropriate cache paths to avoid caching unnecessary files

### 2. Cache Key Strategy
- Use specific cache keys to avoid false cache hits
- Include version identifiers for tools/binaries
- Use file hashes for content-dependent caches

### 3. Fallback Strategy
- Always include restore-keys for graceful degradation
- Ensure the workflow works even when all caches miss

## Troubleshooting

### Cache Not Working
1. Check cache key format and uniqueness
2. Verify cache paths are correct
3. Ensure restore-keys are properly configured
4. Check GitHub Actions cache storage limits

### Performance Still Slow
1. Monitor which steps are taking the most time
2. Consider additional caching opportunities
3. Check if services are starting efficiently
4. Verify k6 test scripts are optimized

## Future Optimizations

### Potential Improvements
1. **Test Result Caching**: Cache test results for unchanged code paths
2. **Service Health Caching**: Cache service readiness checks
3. **k6 Extensions Caching**: If using k6 extensions, cache compiled extensions
4. **Parallel Testing**: Split k6 tests into parallel jobs with shared cache

### Metrics to Track
- Average CI execution time
- Cache hit/miss ratios
- Resource usage (CPU, memory)
- Test reliability and flakiness

## Commands for Local Testing

```bash
# Test with caching simulation
make k6-test-ci

# Run without cache (simulate cache miss)
rm -rf node_modules .k6 && make k6-test-ci

# Monitor Docker layer usage
docker system df

# Check k6 installation
k6 version
```

## Related Files

- `.github/workflows/ci-nestjs.yml` - Main CI workflow with caching
- `package.json` - Node dependencies and k6 scripts
- `docker/docker-compose.local.yml` - Docker services configuration
- `Makefile` - Local testing commands
- `scripts/advanced-test.js` - Main k6 test script

## Updates

- **2024-01-XX**: Initial caching implementation
- **Future**: Monitor and optimize based on CI performance metrics