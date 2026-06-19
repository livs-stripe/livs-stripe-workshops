import { NextResponse } from 'next/server'
import { getProvisioningStatus } from '@/lib/stripe-accounts'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const status = await getProvisioningStatus(id)
  return NextResponse.json(status)
}
