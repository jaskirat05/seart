"use client"

import { useState } from 'react';
import Header from '../components/Header';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = {
    monthly: [
      {
        name: 'Free',
        price: 0,
        features: [
          '50 images per month',
          'Basic resolution options',
          'Standard support',
          'Community access'
        ],
        buttonText: 'Get Started',
        isPopular: false
      },
      {
        name: 'Pro',
        price: 29,
        features: [
          'Unlimited images',
          'All resolution options',
          'Priority support',
          'Advanced features',
          'API access',
          'Custom branding'
        ],
        buttonText: 'Upgrade to Pro',
        isPopular: true
      }
    ],
    yearly: [
      {
        name: 'Free',
        price: 0,
        features: [
          '50 images per month',
          'Basic resolution options',
          'Standard support',
          'Community access'
        ],
        buttonText: 'Get Started',
        isPopular: false
      },
      {
        name: 'Pro',
        price: 290,
        features: [
          'Unlimited images',
          'All resolution options',
          'Priority support',
          'Advanced features',
          'API access',
          'Custom branding'
        ],
        buttonText: 'Upgrade to Pro',
        isPopular: true,
        savings: '2 months free!'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-5 text-xl text-gray-500">
            Choose the plan that's right for you
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-12 flex justify-center">
          <div className="relative bg-gray-100 p-0.5 rounded-full flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`${
                billingCycle === 'monthly'
                  ? 'bg-[#FFA41D] text-white'
                  : 'text-gray-700'
              } relative w-32 rounded-full py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 transition-colors duration-200`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`${
                billingCycle === 'yearly'
                  ? 'bg-[#FFA41D] text-white'
                  : 'text-gray-700'
              } relative w-32 rounded-full py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 transition-colors duration-200`}
            >
              Yearly billing
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans[billingCycle].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
                plan.isPopular
                  ? 'border-2 border-[#FFA41D] relative'
                  : 'border border-gray-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                  <span className="inline-flex rounded-full bg-[#FFA41D] px-4 py-1 text-sm font-semibold text-white">
                    Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    {plan.price === 0 ? '' : `/${billingCycle === 'yearly' ? 'year' : 'month'}`}
                  </span>
                </p>
                {plan.savings && (
                  <p className="mt-2 text-sm text-[#FFA41D] font-semibold">
                    {plan.savings}
                  </p>
                )}
                <button
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    plan.isPopular
                      ? 'bg-[#FFA41D] text-white hover:bg-[#FFA41D]/90'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <svg
                        className={`flex-shrink-0 h-5 w-5 ${
                          plan.isPopular ? 'text-[#FFA41D]' : 'text-green-500'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
