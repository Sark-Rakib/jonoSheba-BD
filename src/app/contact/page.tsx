import type { Metadata } from "next";
import { Mail, MessageSquareWarning, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { CONTACT_EMAIL } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "যোগাযোগ",
  description: "জনসেবা BD-এর সাথে যোগাযোগ করুন — প্রশ্ন, পরামর্শ বা অভিযোগ।",
};

export default function ContactPage(): React.ReactNode {
  return (
    <div className="container-page py-8">
      <PageHeader
        title="যোগাযোগ"
        subtitle="প্রশ্ন, পরামর্শ বা অভিযোগ — আমরা শুনতে প্রস্তুত"
      />

      <div className="flex flex-col gap-6">
        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-ink">আমাদের লিখুন</h2>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">ইমেইল</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-primary-700 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  সাধারণত ২–৩ কর্মদিবসের মধ্যে উত্তর দেওয়া হয়।
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">ঠিকানা</p>
                <p className="text-sm text-ink-muted">ঢাকা, বাংলাদেশ</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">সময়</p>
                <p className="text-sm text-ink-muted">
                  রবিবার–বৃহস্পতিবার, সকাল ১০টা – সন্ধ্যা ৬টা
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="card border-accent-200 bg-accent-50 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-accent-800">
            <MessageSquareWarning className="h-5 w-5" aria-hidden="true" />
            কোনো তালিকায় ভুল তথ্য আছে?
          </h2>
          <p className="text-sm leading-6 text-accent-800">
            নির্দিষ্ট তালিকা, রিভিউ বা নির্দেশিকার পাতায় “ভুল তথ্য জানান”
            বাটনে ক্লিক করে সরাসরি রিপোর্ট করুন — আমাদের টিম তা যাচাই করবে।
            অভিযোগের জন্য ইমেইলে বিস্তারিত লিখে পাঠান।
          </p>
        </section>

        <section className="card p-6">
          <h2 className="mb-2 text-base font-semibold text-ink">ব্যবসা যুক্ত করতে চান?</h2>
          <p className="text-sm leading-6 text-ink-muted">
            নিবন্ধন করে ব্যবসায়িক ড্যাশবোর্ড থেকে আপনার সেবা যোগ করুন। তথ্য
            যাচাইয়ের পর তালিকাটি প্রকাশ করা হবে। সহায়তার জন্য উপরের ইমেইলে
            যোগাযোগ করুন।
          </p>
        </section>
      </div>
    </div>
  );
}
