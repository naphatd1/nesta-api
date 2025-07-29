import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase credentials not found. File storage will use local storage.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Supabase storage service initialized');
  }

  async uploadFile(
    bucketName: string,
    filePath: string,
    fileBuffer: Buffer,
    options?: {
      contentType?: string;
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<{ url: string; path: string }> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      // Use service role key for admin operations
      const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
      let supabaseClient = this.supabase;

      if (serviceRoleKey) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
      }

      const { data, error } = await supabaseClient.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: options?.contentType,
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false,
        });

      if (error) {
        this.logger.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error) {
      this.logger.error('Failed to upload to Supabase:', error);
      throw error;
    }
  }

  async deleteFile(bucketName: string, filePath: string): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        this.logger.error('Supabase delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      this.logger.log(`File deleted from Supabase: ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to delete from Supabase:', error);
      throw error;
    }
  }

  async getSignedUrl(
    bucketName: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        this.logger.error('Supabase signed URL error:', error);
        throw new Error(`Signed URL failed: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      this.logger.error('Failed to get signed URL:', error);
      throw error;
    }
  }

  async listFiles(bucketName: string, folder?: string): Promise<any[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .list(folder);

      if (error) {
        this.logger.error('Supabase list error:', error);
        throw new Error(`List failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Failed to list files:', error);
      throw error;
    }
  }

  async createBucket(bucketName: string, isPublic: boolean = true): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      // Use service role key for admin operations
      const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
      let supabaseClient = this.supabase;

      if (serviceRoleKey) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
      }

      const { error } = await supabaseClient.storage.createBucket(bucketName, {
        public: isPublic,
      });

      if (error && error.message !== 'Bucket already exists') {
        this.logger.error('Supabase create bucket error:', error);
        throw new Error(`Create bucket failed: ${error.message}`);
      }

      this.logger.log(`Bucket created or already exists: ${bucketName}`);
    } catch (error) {
      this.logger.error('Failed to create bucket:', error);
      // Don't throw error for bucket creation - just log and continue
      this.logger.warn('Continuing without bucket creation...');
    }
  }

  getPublicUrl(bucketName: string, filePath: string): string {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  isEnabled(): boolean {
    return !!this.supabase;
  }
}