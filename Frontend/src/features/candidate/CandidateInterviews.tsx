import CandidateNavHeader from "./CandidateNavHeader";

const CandidateInterviews = () => {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] relative font-sans">
      <div className="w-full min-h-screen bg-[rgba(15,15,25,0.95)] backdrop-blur-[20px] border border-white/10">
        <CandidateNavHeader title="SCHEDULED INTERVIEWS" currentPage="interviews" />

        <div className="">
          <h2 className="text-white text-2xl font-semibold mb-6 flex items-center gap-3 max-[768px]:text-xl">
            Upcoming Interviews
          </h2>

        

          <div className="text-center py-10 text-[#94a3b8]">
            <p>No accepted interviews yet.</p>
            <p className="text-[#64748b] text-sm mt-2">
              Once an interviewer accepts your scheduled interview, it will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviews;
