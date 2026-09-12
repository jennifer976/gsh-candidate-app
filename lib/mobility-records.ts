import type { WorkAuthorization, Qualification, ProfessionalRegistration } from "@/types/mobility";
import { canonicalCountryCode } from "./countries";

/** Structured local validation preserves English Error.message for existing callers. */
export class MobilityRecordError extends Error {
  readonly record: string;
  readonly index: string;
  constructor(readonly copyKey: string, label: string) {
    super(copyKey.replace("{label}", label));
    const split = label.lastIndexOf(" ");
    this.record = label.slice(0, split);
    this.index = label.slice(split + 1);
  }
}
function date(value: string | undefined, label: string) {
  if (!value?.trim()) return undefined;
  const clean=value.trim();const parsed=new Date(`${clean}T00:00:00.000Z`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(clean)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==clean) throw new MobilityRecordError("{label}: use a real date in YYYY-MM-DD format.",label);
  return clean;
}
function country(value: string | undefined,label:string,required=true) {
  if(!required&&!value?.trim()) return undefined;
  const code=canonicalCountryCode(value||"");
  if(!code)throw new MobilityRecordError("{label}: enter a recognised country name.",label);
  return code;
}
export function validateMobilityRecords(work:WorkAuthorization[],qualifications:Qualification[],registrations:ProfessionalRegistration[]) {
  const workAuthorizations=work.map((r,i)=>{
    const label=`Work permission ${i+1}`;
    if(!r.authorizationType?.trim())throw new MobilityRecordError("{label}: add the permission type.",label);
    if(!["confirmed","pending","expired","unknown"].includes(r.status))throw new MobilityRecordError("{label}: select a status.",label);
    return {...r,country:country(r.country,label)!,authorizationType:r.authorizationType.trim(),expiresAt:date(r.expiresAt,label)};
  });
  const quals=qualifications.map((r,i)=>{
    const label=`Qualification ${i+1}`;
    if(!r.name.trim())throw new MobilityRecordError("{label}: add its name.",label);
    return {...r,name:r.name.trim(),country:country(r.country,label,false),awardedAt:date(r.awardedAt,label),expiresAt:date(r.expiresAt,label)};
  });
  const professionalRegistrations=registrations.map((r,i)=>{
    const label=`Registration ${i+1}`;
    if(!r.registrationType.trim())throw new MobilityRecordError("{label}: add the registration type.",label);
    if(!["active","pending","expired","not_held","unknown"].includes(r.status))throw new MobilityRecordError("{label}: select a status.",label);
    return {...r,country:country(r.country,label)!,registrationType:r.registrationType.trim(),expiresAt:date(r.expiresAt,label)};
  });
  return {workAuthorizations,qualifications:quals,professionalRegistrations};
}
