import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastContext } from '@/context/ToastContext';

export default function ContactPage() {
  const toast = useToastContext();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await new Promise(res => setTimeout(res, 600));
      toast.success('Your message has been sent to support!');
      reset();
    } catch (e) {
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 text-text-primary">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <Badge variant="default">Get in Touch</Badge>
        <h1 className="text-3xl font-bold text-text-primary">Contact LoanGauge Support</h1>
        <p className="text-text-secondary text-sm">
          Have questions about your readiness score or subscription tier? Our advisory support team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-6 border-border bg-white rounded space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Contact Details</h3>

            <div className="space-y-4 text-xs text-text-secondary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-surface-hover border border-border flex items-center justify-center text-text-primary shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-text-muted uppercase block">Email Support</span>
                  <span className="font-semibold text-text-primary">loangauge70@gmail.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-surface-hover border border-border flex items-center justify-center text-text-primary shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-text-muted uppercase block">Phone Advisory</span>
                  <span className="font-semibold text-text-primary">+91-8126924152</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-surface-hover border border-border flex items-center justify-center text-text-primary shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-text-muted uppercase block">Headquarters</span>
                  <span className="font-semibold text-text-primary">Kharghar, Navi Mumbai</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <Card className="p-6 sm:p-8 border-border bg-white rounded space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Send Us a Message</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Anya Yadav"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="youremail@example.com"
                {...register('email', { required: 'Email is required' })}
                error={errors.email?.message}
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-text-secondary">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  {...register('message', { required: 'Message is required' })}
                  className={`w-full rounded bg-white border p-3 outline-none text-sm text-text-primary placeholder:text-text-muted ${
                    errors.message ? 'border-primary-600' : 'border-border-strong focus:border-primary-500'
                  }`}
                  placeholder="How can our advisory team help you?"
                />
                {errors.message && (
                  <p className="text-xs text-text-secondary mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isSubmitting} rightIcon={Send}>
                Send Message
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}

