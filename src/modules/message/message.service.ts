import { UserService } from './../user/user.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MESSAGE_REPOSITORY } from '../constants';
import { Message } from './message.entity';
import { Cache } from 'cache-manager';
import { LoggerService } from 'src/core/logger/logger.service';
import { LoggerBase } from 'src/core/logger/logger.base';

@Injectable()
export class MessageService extends LoggerBase {
  constructor(
    private readonly userService: UserService,
    @Inject(MESSAGE_REPOSITORY) private readonly repo: typeof Message,
    //@Inject(CACHE_MANAGER) private cacheService: Cache,
    protected readonly logger: LoggerService,
  ) {
    super(logger);
  }

  protected getServiceName(): string {
    return 'MessageService';
  }

  protected getFileName(): string {
    return __filename;
  }

  async create(content: string, userId?: string, guildID?: string): Promise<Message> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const message = await this.repo.create({
        userId,
        content,
        guildID,
      });

      this.logInfo('Message created by user:', user.id);
      return message;
    } catch (error) {
      this.logError('Error creating message:', error);
      throw error;
    }
  }

  async findOne(id: string, guildId?: string) {
    const message = await this.repo.findOne<Message>({
      where: { id, guildID: guildId },
    });
    if (!message) {
      this.logWarn('Message not found:', id);
      throw new NotFoundException('message not found');
    }
    return message;
  }

  async findAll(userID: string, guildID: string) {
    const messages = await this.repo.findAll<Message>({
      where: { userId: userID, guildID: guildID },
    });
    if (!messages || messages.length === 0) {
      this.logWarn('Messages not found:', userID);
      throw new NotFoundException('messages not found');
    }
    return messages;
  }

  async remove(id: string) {
    const message = await this.repo.findByPk<Message>(id);
    if (!message) {
      this.logWarn('Message not found:', id);
      throw new NotFoundException('message not found');
    }

    try {
      await message.destroy();
      this.logInfo('Message deleted:', message.id); //check here
    } catch (error) {
      this.logError('Error deleting message:', error);
      throw error;
    }
  }

  async update(id: string, attrs: Partial<Message>) {
    const message = await this.repo.findByPk<Message>(id);
    if (!message) {
      this.logWarn('Message not found:', id);
      throw new NotFoundException('message not found');
    }
    Object.assign(message, attrs);
    try {
      const updatedMessage = await message.save();
      //this.logInfo('Message updated:', updatedMessage.id);
      return updatedMessage;
    } catch (err) {
      this.logError('Error updating message:', err);
      throw err;
    }
  }
}
