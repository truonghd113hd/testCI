import { glob } from 'glob';
import { forEach } from 'lodash';
import path from 'path';
import bluebird from 'bluebird';
async function main() {
  const seeders = glob.sync(path.join(__dirname, '', '*.ts'), {
    ignore: ['**/base-seeder.ts', '**/seeder.ts'],
  });
  seeders.sort();

  const seederOptions = seeders.map((seeder) => path.basename(seeder, '.ts'));

  seederOptions.unshift('ALL');

  console.log('##############################################################################################');
  console.log('###################################  SEEDING  #################################################');
  console.log('##############################################################################################');
  console.log(`Please enter the seeder's index you wish to run:`);

  forEach(seederOptions, (seeder, index) => {
    console.log(`${index}. ${seeder}`);
  });
  console.log('\n');
  console.log(`Your choice: (e.g. '0' for 'ALL')`);

  const seedIndex = await new Promise<string>((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', (data) => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });

  if (!seederOptions[seedIndex]) {
    console.log('Invalid seeder index');
    process.exit(1);
  }

  if (seedIndex !== '0') {
    const seederName = seederOptions[seedIndex];
    const seederPath = path.join(__dirname, `${seederName}.ts`);

    console.log(`Running seeder ${seederName}...`);

    try {
      const { seeder } = await import(seederPath);
      await seeder.down();
      await seeder.up();
      console.log(`Seeder ${seederName} done`);
      process.exit(0);
    } catch (err) {
      console.log(`Seeder ${seederName} failed`);
      console.log(err);
      process.exit(1);
    }
  }

  console.log('Running all seeders...');

  try {
    console.log('Clearing all seeders...');
    const reverseSeeders = seeders.slice().reverse();
    await bluebird.each(reverseSeeders, async (seederPath) => {
      const { seeder } = await import(seederPath);
      return seeder.down();
    });

    await bluebird.each(seeders, async (seederPath) => {
      const { seeder } = await import(seederPath);
      return seeder.up();
    });

    console.log('All seeders done');
    process.exit(0);
  } catch (err) {
    console.log('All seeders failed');
    console.log(err);
    process.exit(1);
  }
}

main();
