import {Migration} from '@mikro-orm/migrations';

export class Migration20241119174820 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`apollo_api_key\` add column \`user_id\` text not null;`
    );
  }
}
