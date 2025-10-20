// Application Types
// Interface cho dữ liệu thực tế từ API backend
export interface ApiApplicationResponse {
  success: boolean;
  message: string;
  application?: {
    id: string;
    appCode: string;
    status: string;
    businessName: string;
    bizRegNo?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    docs?: string;
    noteAdmin?: string;
    ownerUser?: {
      id: string;
      userId: string;
      name: string;
      email: string;
      phone: string;
    };
    createdAt: string;
    decidedAt?: string;
  };
}

export interface CreateApplicationResponse {
  success: boolean;
  message: string;
  application?: {
    id: string;
    appCode: string;
    status: string;
    businessName: string;
  };
}

export interface ApplicationDoc {
  type: string;
  url: string;
  name: string;
}

export interface ApplicationFormData {
  businessName: string;
  bizRegNo: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  docs: ApplicationDoc[];
}
