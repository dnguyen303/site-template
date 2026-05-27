import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <div>
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your Headline Here
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your subheadline. What you do, who you serve, why they should choose you.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700"
          >
            Get a Free Quote
          </a>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Service One", "Service Two", "Service Three"].map((s) => (
              <div key={s} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{s}</h3>
                <p className="text-gray-600 text-sm">Short description of this service.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Get in Touch</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
