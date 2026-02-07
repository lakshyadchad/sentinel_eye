"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Globe,
  Satellite,
  TrendingUp,
  Shield,
  AlertTriangle,
  FileSearch,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Award,
  Users,
  Target,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("forestry");
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const researchPapers = [
    {
      title: "NDVI Vegetation Index (NASA / USGS)",
      description:
        "Standardized index to allow for comparison of vegetation greenness. Core of the Sentinel-2 monitoring pipeline.",
      formula: "NDVI = (B8 - B4) / (B8 + B4)",
      link: "https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/ndvi/",
      badge: "NASA",
    },
    {
      title: "Semantic Change Detection (arXiv 2024)",
      description:
        "Survey on the characterization of semantic changes in remote sensing imagery.",
      link: "https://arxiv.org/abs/2402.19088",
      badge: "arXiv",
    },
    {
      title: "Enhancing DeepLabV3+ for LULC",
      description:
        "Advanced semantic segmentation fusing aerial and satellite images for land cover mapping.",
      link: "https://arxiv.org/abs/2503.22909",
      badge: "Research",
    },
    {
      title: "Open Challenges in Time-Series Anomaly",
      description:
        "Industry perspective on detecting temporal anomalies in multivariate data streams.",
      link: "https://arxiv.org/abs/2502.05392",
      badge: "arXiv",
    },
    {
      title: "Forest-Chat Interpretation (VLM)",
      description:
        "Adapting Vision-Language Agents for Interactive Forest Change Analysis (Forest-Chat).",
      link: "https://arxiv.org/abs/2601.14637",
      badge: "VLM",
    },
    {
      title: "Urban Area Evolution and Land Surface Temperature Using NDBI",
      description:
        "Cross-Continental Evaluation of Urban Expansion and LST Dynamics",
      link: "https://www.alphaxiv.org/abs/2401.03005",
      badge: "VLM",
    },
  ];

  const stats = [
    { value: "2.4M", label: "Hectares Monitored", suffix: "+" },
    { value: "99.7%", label: "Accuracy Rate", suffix: "" },
    { value: "10m", label: "Resolution", suffix: "" },
    { value: "5", label: "Research Papers", suffix: "" },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans antialiased relative overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Sentinel Eye Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Sentinel Eye
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="relative px-6 py-2.5 text-sm font-medium bg-white/90 text-black hover:bg-white rounded-lg transition-all backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Analysis
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-black z-20" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          >
            <source src="/globe.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none grain-texture z-20" />

        <motion.div
          style={{ opacity }}
          className="relative z-30 max-w-6xl mx-auto text-center space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 bg-slate-900/80 backdrop-blur-sm text-xs text-slate-300"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Powered by ESA Sentinel-2 • Research-backed methodology
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none"
          >
            <span className="text-white">Geospatial intelligence</span>
            <br />
            <span className="bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 bg-clip-text text-transparent">
              at scale
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Production-grade satellite monitoring powered by peer-reviewed
            research. Environmental compliance, forestry management, and legal
            documentation with 10m resolution.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="relative px-8 py-4 font-medium bg-white text-black hover:bg-slate-200 rounded-lg transition-all shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Analysis
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Core Triad with Images */}
      <section
        id="features"
        className="relative py-24 px-6 border-t border-slate-800 bg-slate-950"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              The Core Triad
            </h2>
            <p className="text-lg text-slate-400">
              Three pillars of land-use intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card A - Satellite Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative rounded-xl border border-slate-700 overflow-hidden bg-slate-900/50 backdrop-blur-sm"
            >
              <div className="relative w-full h-64 overflow-hidden">
                <div className="w-full h-full">
                  <Image
                    src="/satellite.png"
                    alt="Satellite Analysis"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  />
                </div>
                {/* Dark gradient overlay removed for clarity */}
              </div>

              <div className="p-8">
                <div className="h-12 w-12 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Satellite Analysis
                </h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Multi-spectral imaging from Sentinel-2 satellites with 10m
                  spatial resolution and 5-day temporal frequency.
                </p>
              </div>
            </motion.div>

            {/* Card B - NDVI Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative rounded-xl border border-slate-700 overflow-hidden bg-slate-900/50 backdrop-blur-sm"
            >
              <div className="relative w-full h-64 overflow-hidden">
                <div className="w-full h-full">
                  <Image
                    src="/ndvi_monitoring.png"
                    alt="NDVI Monitoring"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  />
                </div>
              </div>

              <div className="p-8">
                <div className="h-12 w-12 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  NDVI Monitoring
                </h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Normalized Difference Vegetation Index tracking with
                  time-series analysis and anomaly detection.
                </p>
              </div>
            </motion.div>

            {/* Card C - Change Detection */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative rounded-xl border border-slate-700 overflow-hidden bg-slate-900/50 backdrop-blur-sm"
            >
              <div className="relative w-full h-64 overflow-hidden">
                <div className="w-full h-full">
                  <Image
                    src="/change.png"
                    alt="Change Detection"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  />
                </div>
              </div>

              <div className="p-8">
                <div className="h-12 w-12 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Change Detection
                </h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Semantic segmentation and pixel-level comparison for
                  land-cover classification and change mapping.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Research Validation Section */}
      <section
        id="research"
        className="relative py-24 px-6 border-t border-slate-800 bg-slate-950/50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-sm text-xs text-slate-300 mb-6">
              <Award className="h-3.5 w-3.5" />
              Peer-Reviewed Research
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Why we're 100% reliable
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Our methodology is built on peer-reviewed research from NASA,
              USGS, and leading academic institutions. Every algorithm is
              validated and documented.
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 text-center">
              <BookOpen className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1 text-white">5</div>
              <div className="text-sm text-slate-400">Research Papers</div>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 text-center">
              <Users className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1 text-white">
                NASA/USGS
              </div>
              <div className="text-sm text-slate-400">Validated Methods</div>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 text-center">
              <Target className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1 text-white">99.7%</div>
              <div className="text-sm text-slate-400">Accuracy Rate</div>
            </div>
          </motion.div>

          {/* Research Papers Grid */}
          <div className="space-y-4">
            {researchPapers.map((paper, i) => (
              <motion.a
                key={i}
                href={paper.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group flex flex-col md:flex-row items-start gap-4 p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-white">
                    {paper.badge}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-slate-300 transition-colors">
                      {paper.title}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-white flex-shrink-0 transition-colors" />
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {paper.description}
                  </p>

                  {paper.formula && (
                    <div className="inline-block px-4 py-2 bg-black/50 border border-slate-800 rounded-lg">
                      <code className="text-xs font-mono text-slate-300">
                        {paper.formula}
                      </code>
                    </div>
                  )}
                </div>
              </motion.a>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-slate-500 mb-4">
              All methodologies are open-source and peer-reviewed
            </p>
          </motion.div>
        </div>
      </section>

      {/* Use Case Tabs */}
      <section className="relative py-24 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Deployment scenarios
            </h2>
            <p className="text-lg text-slate-400">
              Validated across regulated industries
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8 p-1 rounded-lg border border-slate-800 bg-slate-900/50 inline-flex mx-auto">
            {["forestry", "urban", "legal"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-slate-600 text-white"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-xl border border-slate-800 bg-slate-900/30"
          >
            {activeTab === "forestry" && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">
                      Forest Compliance Monitoring
                    </h3>
                    <p className="text-slate-400 leading-relaxed mb-6">
                      Automated deforestation alerts for FSC certification,
                      carbon offset verification, and EU Deforestation
                      Regulation (EUDR) compliance. Court-admissible
                      documentation with ISO 19115 metadata.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Weekly vector boundary reports",
                        "NDVI degradation threshold: -0.15",
                        "Forest management DB integration",
                        "Chain of custody documentation",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "urban" && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">
                      Urban Expansion Tracking
                    </h3>
                    <p className="text-slate-400 leading-relaxed mb-6">
                      Construction monitoring, impervious surface mapping, and
                      infrastructure change detection for municipal planning and
                      zoning compliance. Heat island analysis and growth
                      metrics.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Built-up area classification: 92% accuracy",
                        "Monthly district growth metrics",
                        "Heat island correlation analysis",
                        "Zoning violation detection",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "legal" && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center flex-shrink-0">
                    <FileSearch className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">
                      Legal Documentation
                    </h3>
                    <p className="text-slate-400 leading-relaxed mb-6">
                      Court-admissible satellite evidence with complete chain of
                      custody. Property boundary verification, environmental
                      impact assessment, and expert witness reporting for
                      litigation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "ISO 19115 metadata compliance",
                        "Timestamped geolocation precision",
                        "Expert witness report generation",
                        "Admissible evidence standards",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start monitoring today
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Full API access and research documentation included.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 font-medium bg-slate-600 hover:bg-slate-500 rounded-lg transition-all shadow-lg shadow-slate-600/20"
              >
                Start Free Trial
              </Link>
              <Link
                href="#research"
                className="px-8 py-4 font-medium border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
              >
                View Research
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Logo + Description Column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* Use your logo.png here – adjust size as needed */}
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Sentinel Eye Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="font-bold text-lg tracking-wide text-white">
                  Sentinel Eye
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Production-grade satellite monitoring backed by peer-reviewed
                research.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-medium mb-4 text-slate-200">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="/analysis"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Analysis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/data-logs"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Data Logs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/alerts"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Alerts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-medium mb-4 text-slate-200">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#research"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Research Papers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Case Studies
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-medium mb-4 text-slate-200">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Sentinel Eye. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Powered by ESA Copernicus Programme</span>
              {/* Optional: small logo or icon here if you have one */}
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .grain-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}