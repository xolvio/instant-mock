import {existsSync, readdirSync, readFileSync} from 'fs';
import {join} from 'path';
import {logger} from './logger';

export interface SchemaSource {
  name: string;
  schema: string;
}

export class SchemaLoader {
  private schemaDirectory: string;

  // TODO it's supposed to be src/graphql for dev env
  constructor(schemaDirectory: string = join(process.cwd(), 'dist/graphql/')) {
    this.schemaDirectory = process.env.SCHEMA_DIRECTORY || schemaDirectory;
    logger.startup('SchemaLoader initialized', {
      schemaDirectory: this.schemaDirectory,
    });
  }

  async loadFromFiles(): Promise<SchemaSource[]> {
    logger.info('Loading schemas from files', {
      directory: this.schemaDirectory,
    });

    try {
      if (!existsSync(this.schemaDirectory)) {
        logger.warn('Schema directory does not exist', {
          directory: this.schemaDirectory,
        });
        return [];
      }

      const files = readdirSync(this.schemaDirectory).filter((file) =>
        file.endsWith('.graphql')
      );

      return files.map((file) => {
        const content = readFileSync(join(this.schemaDirectory, file), 'utf8');
        const name = file.replace('.graphql', '');
        const schema = content;
        logger.debug('Loaded schema file', {name});
        return {name, schema};
      });
    } catch (error) {
      logger.error('Failed to load schemas from files', {error});
      return [];
    }
  }
}
