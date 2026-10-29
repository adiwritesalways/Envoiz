import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, User } from "lucide-react";
import { brandName } from "@/lib/envoiz";
import { posts } from "./index";

export const Route = createFileRoute("/resources/blog/$slug")({
  head: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    return {
      meta: [
        { title: `${post?.title ?? "Blog Post"} - ${brandName}` },
        { name: "description", content: post?.excerpt ?? "Envoiz blog post" },
      ],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link to="/resources/blog" className="mt-4 text-neutral-400 hover:text-white underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
        <div className="h-[500px] w-[900px] -translate-y-1/3 rounded-full bg-white/[0.03] blur-[140px]" />
      </div>

      <article className="relative z-10 mx-auto max-w-4xl px-6 py-12 md:py-20">
        <div className="mb-8">
          <Link
            to="/resources/blog"
            className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all posts
          </Link>
        </div>

        <header className="mb-12">
          <div className="mb-4 inline-flex items-center rounded-full border border-[#2A2A2A] bg-[#111111] px-3 py-1 text-[11px] font-medium text-[#aaaaaa]">
            {post.category}
          </div>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-white md:text-5xl leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-[#888888]">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#555555]">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {post.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {post.readTime}
            </span>
            <span>•</span>
            <span>{post.date}</span>
          </div>
        </header>

        <div className="prose prose-invert prose-neutral max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-400">
          <PostContent slug={slug} />
        </div>
      </article>
    </div>
  );
}

function PostContent({ slug }: { slug: string }) {
  if (slug === "write-professional-invoice") {
    return (
      <>
        <p>
          Sending an invoice is one of the most exciting parts of freelancing, but it can also be
          the most stressful when payments are delayed. We've found that the way you format and
          write your invoices has a direct impact on how quickly you get paid.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          1. Be clear and specific
        </h3>
        <p>
          Vague descriptions like "Web Design Services" often lead to follow-up questions from the
          client's accounting department. Instead, use specific line items: "Website Redesign - Home
          Page and About Page (15 hours)."
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          2. Set explicit payment terms
        </h3>
        <p>
          "Net 30" is standard, but if you want to be paid faster, consider shorter terms like "Net
          15" or "Due on Receipt". Make sure this is clearly communicated before the project begins.
        </p>
        <img
          src="/blog-assets/invoice-form.png"
          alt="Envoiz Invoice Form showcasing line items and terms"
          className="my-10 w-full rounded-xl border border-[#2A2A2A] shadow-2xl"
        />
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          3. Include all necessary details
        </h3>
        <p>
          Double-check that your invoice includes:
          <ul>
            <li>Your business name and contact info</li>
            <li>Client's correct business name and address</li>
            <li>Invoice number (for easy tracking)</li>
            <li>Date of issue and due date</li>
            <li>Clear breakdown of costs (subtotal, taxes, total)</li>
          </ul>
        </p>
      </>
    );
  }

  if (slug === "envoiz-v1-2-whats-new") {
    return (
      <>
        <p>
          We are thrilled to announce the release of Envoiz v1.2! This update brings several highly
          requested features and performance improvements to make your invoicing experience even
          smoother.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          Lightning Fast PDF Generation
        </h3>
        <p>
          We've completely rewritten our PDF rendering engine. Invoices now generate and download up
          to 3x faster, meaning less waiting and more doing.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          Enhanced Dashboard Analytics
        </h3>
        <p>
          Get a clearer picture of your financial health with our new dashboard widgets. Track your
          monthly revenue trends and easily see which invoices are overdue at a glance.
        </p>
        <img
          src="/blog-assets/dashboard.png"
          alt="New Dashboard Analytics"
          className="my-10 w-full rounded-xl border border-[#2A2A2A] shadow-2xl"
        />
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          Sharper Delivery Logs
        </h3>
        <p>
          Ever wonder if a client actually received your invoice? Our improved delivery logs now
          provide more granular details on email delivery status, including open tracking (where
          supported).
        </p>
      </>
    );
  }

  if (slug === "invoice-vs-receipt") {
    return (
      <>
        <p>
          While often used interchangeably in casual conversation, invoices and receipts serve
          distinct and crucial roles in the accounting process. Understanding the difference ensures
          smooth financial operations.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          The Invoice: Requesting Payment
        </h3>
        <p>
          An invoice is a document sent by a seller to a buyer <em>before</em> payment is made. It
          outlines the goods or services provided, the total amount due, and the terms of payment.
          It's essentially a formal request for money.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          The Receipt: Confirming Payment
        </h3>
        <p>
          A receipt is a document provided by the seller to the buyer <em>after</em> payment has
          been received. It acts as proof of purchase and confirms that the transaction is complete.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          Why It Matters
        </h3>
        <p>
          Sending a receipt when you meant to send an invoice can confuse clients and delay payment.
          Conversely, failing to provide a receipt can cause issues for your client's accounting
          department. Envoiz makes it easy to handle both seamlessly.
        </p>
      </>
    );
  }

  if (slug === "5-common-invoicing-mistakes") {
    return (
      <>
        <p>
          Avoid these frequent pitfalls to ensure your cash flow remains healthy and your client
          relationships stay strong.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          1. Delaying the Invoice
        </h3>
        <p>
          The longer you wait to send an invoice after a project is completed, the longer it will
          take to get paid. Make it a habit to invoice immediately.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          2. Unclear Descriptions
        </h3>
        <p>
          If a client doesn't understand what they are paying for, they will delay payment to ask
          for clarification. Be specific about the work done.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          3. Sending to the Wrong Person
        </h3>
        <p>
          In larger organizations, your point of contact might not be the person who handles
          accounts payable. Always confirm who the invoice should be sent to.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          4. Missing or Incorrect Details
        </h3>
        <p>
          A simple typo in the total amount or a missing tax ID can cause an invoice to be rejected
          and require resubmission.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          5. Forgetting to Follow Up
        </h3>
        <p>
          Clients are busy and sometimes invoices slip through the cracks. A polite reminder a few
          days before the due date, and immediately after, is essential.
        </p>
      </>
    );
  }

  if (slug === "tax-calculations-currencies") {
    return (
      <>
        <p>
          Managing taxes across different regions and currencies can be a headache for international
          businesses. Envoiz simplifies this process with a robust calculation engine.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          Consistent Logic
        </h3>
        <p>
          In Envoiz, tax logic is applied <em>after</em> currency normalization. This means whether
          you are invoicing in USD, EUR, or JPY, the underlying tax calculation remains consistent
          and accurate based on the normalized base value.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          A Single Source of Truth
        </h3>
        <p>
          This approach provides finance teams with a reliable, single source of truth for
          multi-market invoicing, reducing discrepancies and simplifying reporting.
        </p>
        <img
          src="/blog-assets/tax-settings.png"
          alt="Tax settings and multi-currency invoice"
          className="my-10 w-full rounded-xl border border-[#2A2A2A] shadow-2xl"
        />
      </>
    );
  }

  if (slug === "getting-paid-on-time") {
    return (
      <>
        <p>
          Consistent cash flow is the lifeblood of any small business. Here are practical steps to
          ensure you get paid on time, every time.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          Establish Clear Terms Upfront
        </h3>
        <p>
          Don't wait until the invoice is sent to discuss payment terms. Make sure they are clearly
          outlined in your initial contract or proposal.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          Implement a Reminder Schedule
        </h3>
        <p>
          Automate your follow-ups. A gentle reminder 3 days before the due date, and an automated
          email the day it becomes overdue, can significantly reduce late payments.
        </p>
        <h3 className="text-xl font-semibold text-[#EAEAEA] mt-10 mb-4 tracking-tight">
          Offer Convenient Payment Methods
        </h3>
        <p>
          The easier you make it to pay, the faster you will receive your money. Offer credit card
          payments or simple bank transfer options directly from the invoice.
        </p>
      </>
    );
  }

  return <p>Content coming soon.</p>;
}
