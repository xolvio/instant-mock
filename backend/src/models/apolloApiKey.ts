import {Entity, PrimaryKey, Property} from '@mikro-orm/core';
import {Encryption} from '../utilities/encryption';

@Entity()
export class ApolloApiKey {
  @PrimaryKey({autoincrement: true})
  id!: number;

  @Property()
  userId!: string;

  @Property()
  encryptedKey!: string;

  @Property()
  iv!: string;

  @Property()
  tag!: string;

  constructor(key: string, userId: string) {
    if (!key) throw new Error('API key cannot be empty');
    if (!userId) throw new Error('User ID is required');

    const encrypted = Encryption.encrypt(key);
    this.userId = userId;
    this.encryptedKey = encrypted.encryptedData;
    this.iv = encrypted.iv;
    this.tag = encrypted.tag;
  }

  getDecryptedKey(): string {
    return Encryption.decrypt(this.encryptedKey, this.iv, this.tag);
  }
}
