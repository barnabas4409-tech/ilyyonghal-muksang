'use client';

import { useEffect, useState } from 'react';
import { getIllustrationByHour } from '@/utils/date';
import type { IllustrationType } from '@/types';
import DawnIllustration from './DawnIllustration';
import NightIllustration from './NightIllustration';
import SpringIllustration from './SpringIllustration';

interface Props {
  type?: IllustrationType;
}

export default function IllustrationBanner({ type }: Props) {
  const [illustrationType, setIllustrationType] = useState<IllustrationType>('spring');

  useEffect(() => {
    setIllustrationType(type ?? getIllustrationByHour());
  }, [type]);

  return (
    <div className="w-full h-[200px] overflow-hidden">
      {illustrationType === 'dawn' && <DawnIllustration />}
      {illustrationType === 'spring' && <SpringIllustration />}
      {illustrationType === 'night' && <NightIllustration />}
    </div>
  );
}
