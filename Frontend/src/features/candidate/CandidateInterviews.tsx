import CandidateNavHeader from "./CandidateNavHeader";

const CandidateInterviews = () => {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] relative font-sans">
      <div className="w-full min-h-screen bg-[rgba(15,15,25,0.95)] backdrop-blur-[20px] border border-white/10">
        <CandidateNavHeader title="SCHEDULED INTERVIEWS" currentPage="interviews" />

        <div className="pt-[72px] py-7 px-12 max-md:py-5 max-md:px-4 pb-20 max-md:pb-12 w-full box-border max-[480px]:p-[18px] max-[480px]:pt-[68px]">
          <h2 className="text-white text-2xl max-md:text-xl font-semibold mb-6 max-md:mb-4 flex items-center gap-3">
            Upcoming Interviews
          </h2>

          <div className="text-center py-10 max-md:py-8 text-[#94a3b8]">
            <p className="text-base max-md:text-sm">No accepted interviews yet.</p>
            <p className="text-[#64748b] text-sm max-md:text-xs mt-2">
              Once an interviewer accepts your scheduled interview, it will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviews;
