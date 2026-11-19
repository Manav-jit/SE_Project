import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllApplications, 
  getApplicationById, 
  createApplication, 
  advanceApplicationStatus,
  ApplicationStatus
} from '@/lib/storage/applications';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const app = await getApplicationById(id);
      if (!app) {
        return NextResponse.json({ error: 'Application reference not found' }, { status: 404 });
      }
      return NextResponse.json({ application: app });
    }

    const all = await getAllApplications();
    return NextResponse.json({ applications: all });
  } catch (error) {
    console.error('Error in applications GET API:', error);
    return NextResponse.json({ error: 'Failed to retrieve applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schemeId, schemeName, category, applicantName, mobile, aadhaarLast4, state, submissionMode, cscCenter, sanctionedAmount } = body;

    if (!schemeId || !schemeName) {
      return NextResponse.json({ error: 'Missing required scheme details' }, { status: 400 });
    }

    const created = await createApplication({
      schemeId,
      schemeName,
      category: category || 'welfare',
      applicantName: applicantName || 'Citizen Applicant',
      mobile,
      aadhaarLast4,
      state: state || 'Uttar Pradesh',
      submissionMode: submissionMode || 'CSC_OFFLINE',
      cscCenter: cscCenter || 'Common Service Centre - District Hub',
      sanctionedAmount,
    });

    return NextResponse.json({ success: true, application: created }, { status: 201 });
  } catch (error) {
    console.error('Error in applications POST API:', error);
    return NextResponse.json({ error: 'Failed to create application record' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, remark } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const updated = await advanceApplicationStatus(id, status as ApplicationStatus, remark);
    if (!updated) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Error in applications PATCH API:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
