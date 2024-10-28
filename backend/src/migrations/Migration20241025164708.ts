import { Migration } from '@mikro-orm/migrations';

export class Migration20241025164708 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "seed_group" ("id" serial primary key, "name" varchar(255) not null);`);
    this.addSql(`alter table "seed_group" add constraint "seed_group_name_unique" unique ("name");`);

    this.addSql(`alter table "seed" alter column "seed_group_id" type int using ("seed_group_id"::int);`);
    this.addSql(`alter table "seed" add constraint "seed_seed_group_id_foreign" foreign key ("seed_group_id") references "seed_group" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "seed" drop constraint "seed_seed_group_id_foreign";`);

    this.addSql(`drop table if exists "seed_group" cascade;`);

    this.addSql(`alter table "seed" alter column "seed_group_id" type varchar(255) using ("seed_group_id"::varchar(255));`);
  }

}
