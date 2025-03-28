import {Migration} from '@mikro-orm/migrations';

export class Migration20241114031254 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      alter table "apollo_api_key" add column "iv" text not null;
    `);
    this.addSql(`
      alter table "apollo_api_key" add column "tag" text not null;
    `);
    this.addSql(`
      alter table "apollo_api_key" rename column "key" to "encrypted_key";
    `);
  }
}
