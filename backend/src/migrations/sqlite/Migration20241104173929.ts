import { Migration } from '@mikro-orm/migrations';

export class Migration20241104173929 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`apollo_api_key\` (\`id\` integer not null primary key autoincrement, \`key\` text not null);`);
  }

}
