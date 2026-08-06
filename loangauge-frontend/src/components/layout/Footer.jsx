import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Gauge size={18} />
              </span>
              <span className="font-heading text-[16px] font-bold text-text-primary">LoanGauge</span>
            </Link>
            <p className="mt-3 text-xs text-text-secondary leading-relaxed">
              Financial readiness engine for confident borrowing.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li><Link to="/how-it-works" className="hover:text-text-primary">How It Works</Link></li>
              <li><Link to="/upgrade" className="hover:text-text-primary">Pricing & Plans</Link></li>
              <li><Link to="/assessments/new" className="hover:text-text-primary">Readiness Calculator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li><Link to="/about" className="hover:text-text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-text-primary">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-text-primary">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Portals</h4>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li><Link to="/login" className="hover:text-text-primary">Borrower Sign In</Link></li>
              <li><Link to="/advisor" className="hover:text-text-primary">Advisor Desk</Link></li>
              <li><Link to="/admin" className="hover:text-text-primary">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} LoanGauge Technologies Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
