import { Mail, Store } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Brand icons (removed from lucide-react v1+) ───────────────────────────
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// ─── Data ───────────────────────────────────────────────────────────────────
const COMPANY_NAME = "دكان";
const COMPANY_DESCRIPTION =
  "منصة التجارة الإلكترونية الموثوقة لبيع وشراء المنتجات عبر الإنترنت في مصر.";

const socialLinks = [
  {
    icon: <FacebookIcon />,
    href: "https://facebook.com",
    ariaLabel: "Facebook",
  },
  { icon: <TwitterIcon />, href: "https://twitter.com", ariaLabel: "Twitter" },
  {
    icon: <InstagramIcon />,
    href: "https://instagram.com",
    ariaLabel: "Instagram",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    href: "mailto:info@dokkan.eg",
    ariaLabel: "Email",
  },
];

const footerSections = [
  {
    header: "روابط سريعة",
    links: [
      { label: "الرئيسية", href: "/", route: true },
      { label: "جميع المنتجات", href: "/products", route: true },
      { label: "لوحة تحكم البائع", href: "/dashboard", route: true },
      { label: "تسجيل الدخول", href: "/auth/login", route: true },
    ],
  },
  {
    header: "للتجار",
    links: [
      {
        label: "كن تاجراً معنا",
        href: "/auth/register",
        route: true,
      },
      { label: "لوحة تحكم البائع", href: "/dashboard", route: true },
      { label: "المنتجات", href: "/products", route: true },
      { label: "إنشاء حساب", href: "/auth/register", route: true },
    ],
  },
  {
    header: "القوانين",
    links: [
      { label: "شروط الخدمة", href: "#", route: false },
      { label: "سياسة الخصوصية", href: "#", route: false },
      { label: "سياسة ملفات الارتباط", href: "#", route: false },
      { label: "سياسة الإرجاع", href: "#", route: false },
    ],
  },
];

// ─── Reusable NavItem ────────────────────────────────────────────────────────
interface NavItemProps {
  label: string;
  href: string;
  route?: boolean;
}

function NavItem({ label, href, route }: NavItemProps) {
  const cls =
    "text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap";
  return (
    <li>
      {route ? (
        <Link className={cls} to={href}>
          {label}
        </Link>
      ) : (
        <a className={cls} href={href}>
          {label}
        </a>
      )}
    </li>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer className="bg-text-dark text-white border-t mt-auto" dir="rtl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg text-white">{COMPANY_NAME}</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              {COMPANY_DESCRIPTION}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.ariaLabel}
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-4 text-lg">
                {section.header}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <NavItem
                    key={i}
                    label={link.label}
                    href={link.href}
                    route={link.route}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {COMPANY_NAME} - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
