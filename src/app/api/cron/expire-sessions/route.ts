import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SESSION_EXPIRY_HOURS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - SESSION_EXPIRY_HOURS * 3600 * 1000).toISOString();
  const { data, error } = await createAdminClient()
    .from("sessions")
    .delete()
    .lt("last_active_at", cutoff)
    .select("id");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deleted: data?.length ?? 0 });
}
