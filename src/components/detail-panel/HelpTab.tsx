'use client'

import { HelpCircle, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { EntityType } from '@/types'

interface HelpTabProps {
  entityType: EntityType
}

interface HelpSection {
  question: string
  answer: string
}

const helpContent: Record<EntityType, { intro: string; sections: HelpSection[] }> = {
  llc: {
    intro:
      'An LLC (Limited Liability Company) is a type of business that keeps your personal money safe if something goes wrong with the company.',
    sections: [
      {
        question: 'What does it protect?',
        answer:
          "If your business gets sued or owes money, the people suing can only go after business money, not your house, car, or savings. It's like a wall between you and the business.",
      },
      {
        question: 'How does it work?',
        answer:
          'You file paperwork with your state to create the LLC. After that, the LLC is its own legal "person." It can own things, sign contracts, and have its own bank account.',
      },
      {
        question: 'What are your responsibilities?',
        answer:
          'You need to file a yearly report with the state and pay a small fee. If you mix personal and business money, the protection can go away. Keep them separate.',
      },
      {
        question: 'What about taxes?',
        answer:
          'Most LLCs pass income straight to the owner. You pay taxes on the money yourself, not the company. This is called "pass-through taxation."',
      },
    ],
  },
  trust: {
    intro:
      'A trust is like a safety box for your property and money. You put things into the trust, and the trust holds them for the people you want to benefit.',
    sections: [
      {
        question: 'Why use a trust?',
        answer:
          "When you pass away, things in a trust skip probate court. That means your family gets what you left them faster and without legal fees. It also keeps things private -- court records are public, but trusts aren't.",
      },
      {
        question: 'Who controls the trust?',
        answer:
          'The trustee manages the trust. If it is a revocable (living) trust, you are usually the trustee while you are alive. You can change or cancel it anytime.',
      },
      {
        question: 'Who benefits from it?',
        answer:
          "The beneficiaries are the people who receive the trust's assets. You decide who they are and when they get things.",
      },
      {
        question: 'Does a trust protect from lawsuits?',
        answer:
          'A basic revocable trust does not offer strong protection from lawsuits. An irrevocable trust can, because once you put something in, you no longer own it.',
      },
    ],
  },
  shelf_corp: {
    intro:
      'A shelf corp is an older company that was already formed and then set aside ("put on a shelf") without doing any business. You buy it to get the benefits of having an older company.',
    sections: [
      {
        question: 'Why would someone use a shelf corp?',
        answer:
          "Some banks and vendors look at how long a company has been around before approving loans or accounts. A shelf corp that's 5 years old looks more established than one formed today.",
      },
      {
        question: 'Is it legal?',
        answer:
          'Yes. Buying and using a shelf corp is legal as long as you follow all normal business rules and disclose ownership properly when required.',
      },
      {
        question: 'What do you need to do after buying one?',
        answer:
          "You'll update the ownership records, get a new EIN if needed, and open a business bank account. You also need to make sure the company stays current on state filings.",
      },
      {
        question: 'Does it have any history?',
        answer:
          'A clean shelf corp has no history, no debt, and no legal problems. Before you buy one, a good provider will confirm it has been inactive and clean.',
      },
    ],
  },
  corporation: {
    intro:
      'A corporation is a company that exists as its own legal person. It can own things, hire people, and be held responsible for what it does -- separate from the owners.',
    sections: [
      {
        question: 'Who owns a corporation?',
        answer:
          'Shareholders own a corporation by holding stock. If you own 100% of the shares, you own the whole company.',
      },
      {
        question: 'How is it run?',
        answer:
          'Corporations have a board of directors who make big decisions. The day-to-day work is handled by officers like a CEO or CFO.',
      },
      {
        question: 'What is double taxation?',
        answer:
          'A standard C-Corp pays taxes on its profits, and then shareholders pay taxes again when they receive money. You can avoid this by choosing S-Corp status.',
      },
      {
        question: 'Why choose a corporation over an LLC?',
        answer:
          'Corporations are often preferred when raising money from investors, because investors are familiar with how stock and ownership work in a corporation.',
      },
    ],
  },
  sole_proprietorship: {
    intro:
      'A sole proprietorship is the simplest type of business. You and the business are the same legal entity. There is no separation between personal and business.',
    sections: [
      {
        question: 'What is the risk?',
        answer:
          "If the business gets sued or owes money, your personal belongings are fair game. Unlike an LLC or corporation, there is no wall between you and the business.",
      },
      {
        question: 'What are the benefits?',
        answer:
          'It is the easiest way to start. No state paperwork, no annual fees. Just start working and report the income on your personal tax return.',
      },
      {
        question: 'Should I upgrade to an LLC?',
        answer:
          "For most businesses with any real risk of lawsuits or debt, upgrading to an LLC makes sense. It adds protection without adding much complexity.",
      },
    ],
  },
  partnership: {
    intro:
      'A partnership is a business owned by two or more people. Each partner shares in the profits, losses, and decisions of the business.',
    sections: [
      {
        question: 'What types are there?',
        answer:
          'A general partnership is the most common. All partners share control and all are personally responsible for debts. A limited partnership has at least one general partner running things and limited partners who only invest.',
      },
      {
        question: 'What should partners have in writing?',
        answer:
          'A partnership agreement spells out who owns what, who makes decisions, and what happens if someone wants out. Never start a partnership without one.',
      },
      {
        question: 'How are taxes handled?',
        answer:
          'Like an LLC, a partnership passes profits to the partners. Each partner reports their share on their own tax return.',
      },
    ],
  },
}

function AccordionItem({ question, answer }: HelpSection) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #1e3a5f' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="text-sm font-medium" style={{ color: '#f1f5f9' }}>
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: '#94a3b8' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p
              className="px-4 pb-4 text-sm leading-relaxed"
              style={{ color: '#94a3b8' }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HelpTab({ entityType }: HelpTabProps) {
  const content = helpContent[entityType] ?? helpContent.llc

  return (
    <div className="space-y-6 pb-6">
      {/* Intro card */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
      >
        <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#3b82f6' }} />
        <p className="text-sm leading-relaxed" style={{ color: '#f1f5f9' }}>
          {content.intro}
        </p>
      </div>

      {/* Accordion sections */}
      <div className="space-y-2">
        {content.sections.map((section) => (
          <AccordionItem key={section.question} {...section} />
        ))}
      </div>
    </div>
  )
}
