import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Grid as GridReact,
  PlusCircle,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";

export default function MainCard({ title, children }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-xl relative rounded-t-sm rounded-b-lg ">
      <div className="p-6">
        <h1 className="text-4xl font-bold text-center mb-2">{title}</h1>
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        {children}
      </div>
    </div>
  );
}
