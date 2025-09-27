import { TransferToken } from "@/src/app/(dashboard)/transfer/TransferToken";
import { Shield } from "lucide-react";

export default function TransferPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
            <div className="w-full max-w-md">
                {/* Anonymous Transfer Note */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-1">Anonymous Transfer</h3>
                            <p className="text-sm text-blue-700 leading-relaxed">
                                Transfer tokens anonymously without your activity being listed on the platform.
                                Your transfer history remains private and won't appear in dashboard analytics.
                            </p>
                        </div>
                    </div>
                </div>

                <TransferToken />
            </div>
        </div>
    )
}