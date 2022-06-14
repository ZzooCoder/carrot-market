import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function () {
  const { data, error } = useSWR("/api/users/me");
  const router = useRouter();

  useEffect(() => {
    if (data && !data.ok) {
      router.replace("/enter");
    }
  }, [router, data]);

  return { user: data?.profile, isLoading: !data && !error };
}
