import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [validatedData.email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Insert new user
    const result: any = await query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role, is_verified)
       VALUES (?, ?, ?, ?, ?, 'user', FALSE)`,
      [
        validatedData.email,
        hashedPassword,
        validatedData.first_name,
        validatedData.last_name,
        validatedData.phone || null,
      ]
    );

    // Send welcome email
    await sendWelcomeEmail({
      email: validatedData.email,
      first_name: validatedData.first_name,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please login to continue.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
