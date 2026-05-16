import { join } from 'path';
import { config } from 'dotenv';

config({ path: join(__dirname, '../../../../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '../../common/enums/user-role.enum';

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      'ERROR: ADMIN_EMAIL and ADMIN_PASSWORD env vars are required',
    );
    process.exit(1);
  }

  const adminFirstName = process.env.ADMIN_FIRST_NAME ?? 'Admin';
  const adminLastName = process.env.ADMIN_LAST_NAME ?? 'User';

  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    const existing = await usersService.getUserByEmail(adminEmail);

    if (existing) {
      if (existing.role === UserRole.ADMIN) {
        console.log(
          `Admin user already exists with email ${adminEmail} — skipping`,
        );
      } else {
        await userRepo.update({ id: existing.id }, { role: UserRole.ADMIN });
        console.log(`User ${adminEmail} updated to ADMIN role`);
      }
    } else {
      const newUser = await usersService.create({
        email: adminEmail,
        password: adminPassword,
        profile: {
          firstName: adminFirstName,
          lastName: adminLastName,
        },
      });
      await userRepo.update({ id: newUser.id }, { role: UserRole.ADMIN });
      console.log(`Admin user created with email ${adminEmail}`);
    }
  } finally {
    await app.close();
  }
}

void seed().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
