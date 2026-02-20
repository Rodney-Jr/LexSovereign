import React from 'react';
import { Link } from '../utils/ssr-compat';
import { ArrowRight, BookOpen } from 'lucide-react';

interface InsightLink {
    slug: string;
    title: string;
    excerpt: string;
    readTime: string;
}

interface RelatedInsightsProps {
    articles: InsightLink[];
    heading?: string;
}

export default function RelatedInsights({ articles, heading = 'From Our Insights' }: RelatedInsightsProps) {
    return (
        <section className="border-t border-slate-800 bg-slate-950">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="flex items-center gap-3 mb-8">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">{heading}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <Link
                            key={article.slug}
                            to={article.slug}
                            className="group flex flex-col bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 transition-colors"
                        >
                            <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-indigo-300 transition-colors leading-snug">
                                {article.title}
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed flex-1 mb-3">
                                {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">{article.readTime}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
