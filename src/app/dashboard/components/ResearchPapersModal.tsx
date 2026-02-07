"use client";

import { ExternalLink, BookOpen } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const papers = [
  {
    title: "1) NDVI Vegetation Index (NASA / USGS)",
    description:
      "Standardized index to allow for comparison of vegetation greenness. Core of the Sentinel-2 monitoring pipeline.",
    formula: "$$NDVI = \\frac{B8 - B4}{B8 + B4}$$",
    link: "https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/ndvi/",
  },
  {
    title: "2) Semantic Change Detection (arXiv 2024)",
    description:
      "Survey on the characterization of semantic changes in remote sensing imagery.",
    link: "https://arxiv.org/abs/2402.19088",
  },
  {
    title: "3) Enhancing DeepLabV3+ for LULC",
    description:
      "Advanced semantic segmentation fusing aerial and satellite images for land cover mapping.",
    link: "https://arxiv.org/abs/2503.22909",
  },
  {
    title: "4) Open Challenges in Time-Series Anomaly",
    description:
      "Industry perspective on detecting temporal anomalies in multivariate data streams.",
    link: "https://arxiv.org/abs/2502.05392",
  },
  {
    title: "5) Forest-Chat Interpretation (VLM)",
    description:
      "Adapting Vision-Language Agents for Interactive Forest Change Analysis (Forest-Chat).",
    link: "https://arxiv.org/abs/2601.14637",
  },
  {
      title: "6) Urban Area Evolution and Land Surface Temperature Using NDBI",
      description:
        "Cross-Continental Evaluation of Urban Expansion and LST Dynamics",
      link: "https://www.alphaxiv.org/abs/2401.03005",
     
    },
];

export default function ResearchPapersModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-white/5 backdrop-blur-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/20 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold leading-none tracking-tight text-white">
            Scientific Foundations
          </h2>
        </div>
        <p className="text-sm text-white/60">
          Peer-reviewed methodology powering the Sentinel Eye analysis pipeline.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
        {papers.map((paper, index) => (
          <a
            key={index}
            href={paper.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col space-y-2 rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                {paper.title}
              </h3>
              <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              {paper.description}
            </p>

            {paper.formula && (
              <div className="mt-2 py-3 bg-black/30 rounded-lg flex justify-center border border-white/5 shadow-inner">
                <span className="text-sm font-mono tracking-wider text-primary/90">
                  {paper.formula}
                </span>
              </div>
            )}
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center p-6 border-t border-white/10 bg-black/20">
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
          Verified Source Documentation
        </p>
        <button
          onClick={onClose}
          className="ml-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
