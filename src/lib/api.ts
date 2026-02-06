const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:5001/api";

export type ApiListResponse<T> = {
  status: string;
  data: {
    [key: string]: any;
  } & T;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  console.log("Making request to:", `${API_BASE_URL}${path}`); // Debug log
  console.log("Request method:", init?.method); // Debug log
  console.log("Request headers:", init?.headers); // Debug log
  console.log("Request body:", init?.body); // Debug log
  console.log("Request body type:", typeof init?.body); // Debug log
  console.log("Request body length:", init?.body ? JSON.stringify(init.body).length : 0); // Debug log
  
  const response = await fetch(`${API_BASE_URL}${path}` , {
    method: init?.method || 'GET',
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    body: init?.body
  });

  console.log("Response status:", response.status); // Debug log

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Request failed with response:", text); // Debug log
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export type Symptom = {
  symptom_id: string;
  name: string;
  severity: string;
  description?: string;
};

export type OutbreakSymptom = {
  symptom_id: Symptom;
  threshold?: number;
  cases_count?: number;
  is_threshold_exceeded?: boolean;
};

export type Outbreak = {
  outbreak_id: string;
  start_date: string;
  end_date?: string;
  status: string;
  description?: string;
  region?: string;
  symptoms: OutbreakSymptom[];
};

export async function fetchOutbreaks(params?: Record<string, string | number>): Promise<Outbreak[]> {
  const query = params
    ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : "";
  const json = await request<ApiListResponse<{ outbreaks: Outbreak[] }>>(`/outbreaks${query}`);
  return json.data.outbreaks || [];
}

export async function fetchSymptoms(params?: Record<string, string | number>): Promise<Symptom[]> {
  const query = params
    ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : "";
  const json = await request<ApiListResponse<{ symptoms: Symptom[] }>>(`/symptoms${query}`);
  return json.data.symptoms || [];
}

export async function submitPublicReport(payload: {
  report_id: string;
  symptoms_text: string;
  state: string;
  symptom_type?: string;
  severity?: string;
  patient_age?: string;
  additional_notes?: string;
}): Promise<{ status: string; message: string }>{
  await request(`/reports/public`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { status: 'success', message: 'Submitted' };
}

export async function publicRegister(payload: { email: string; password: string; name?: string }): Promise<{ token: string }>{
  const json = await request<ApiListResponse<{ user: any; token: string }>>(`/public/register`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { token: (json as any).data.token };
}

export async function publicLogin(payload: { email: string; password: string }): Promise<{ token: string }>{
  const json = await request<ApiListResponse<{ user: any; token: string }>>(`/public/login`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { token: (json as any).data.token };
}

export async function fetchMyPublicReports(token: string): Promise<any[]> {
  const json = await request<ApiListResponse<{ reports: any[] }>>(`/reports/public/mine`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return (json as any).data.reports || [];
}

export async function loginDoctor(payload: { email: string; password: string }): Promise<{ token: string; doctor: any }>{
  const json = await request<ApiListResponse<{ doctor: any; token: string }>>(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { token: (json as any).data.token, doctor: (json as any).data.doctor };
}

export async function registerDoctor(payload: {
  doctor_id: string;
  name: string;
  email: string;
  password: string;
  specialty?: string;
  clinic_id: string;
  region?: string;
  phone?: string;
}): Promise<{ token: string; doctor: any }>{
  const json = await request<ApiListResponse<{ doctor: any; token: string }>>(`/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { token: (json as any).data.token, doctor: (json as any).data.doctor };
}

export async function fetchClinics(): Promise<any[]> {
  const json = await request<ApiListResponse<{ clinics: any[] }>>(`/clinics`);
  return (json as any).data.clinics || [];
}

export async function createPatient(payload: {
  patient_id: string;
  name: string;
  dob: string;
  gender: string;
  address?: string;
  phone?: string;
}, token: string): Promise<any> {
  console.log("API createPatient called with:", { payload, token: token ? "present" : "missing" }); // Debug log
  
  // Ensure we only send the required fields plus any optional fields that have values
  const requestBody = {
    patient_id: payload.patient_id,
    name: payload.name,
    dob: payload.dob,
    gender: payload.gender
  };
  
  if (payload.address) {
    requestBody.address = payload.address;
  }
  if (payload.phone) {
    requestBody.phone = payload.phone;
  }
  
  console.log("Request body being sent:", requestBody); // Debug log
  console.log("Request body JSON string:", JSON.stringify(requestBody)); // Debug log
  console.log("Request body keys:", Object.keys(requestBody)); // Debug log
  console.log("Request body values:", Object.values(requestBody)); // Debug log
  
  const json = await request<ApiListResponse<{ patient: any }>>(`/patients`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(requestBody)
  });
  return (json as any).data.patient;
}

export async function createReport(payload: {
  report_id: string;
  patient_id: string;
  clinic_id: string;
  doctor_id: string;
  symptoms: Array<{
    symptom_id: string;
    onset_date?: string;
    duration?: string;
  }>;
  report_date?: string;
}, token: string): Promise<any> {
  const json = await request<ApiListResponse<{ report: any }>>(`/reports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return (json as any).data.report;
}

export async function fetchDoctorReports(doctor_id: string, token: string): Promise<any[]> {
  const json = await request<ApiListResponse<{ reports: any[] }>>(`/reports?doctor_id=${doctor_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return (json as any).data.reports || [];
}


