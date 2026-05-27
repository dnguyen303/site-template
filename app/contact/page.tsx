import ContactForm from "@/components/ContactForm";

export default function Contact() {
  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-8">Fill out the form and we&apos;ll get back to you shortly.</p>
      <ContactForm />
    </div>
  );
}
