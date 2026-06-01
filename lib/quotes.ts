export interface PatristicQuote {
  text: string;
  author: string;
  years: string;
  source: string;
  sourceOriginal: string;
  context: string;
}

export const PATRISTIC_QUOTES: PatristicQuote[] = [
  {
    text: '나는 하나님의 밀이다. 짐승의 이에 갈려 그리스도의 순수한 빵이 되어야 한다.',
    author: '안티오키아의 이그나티우스',
    years: 'c. 35–107',
    source: '로마인들에게 보내는 편지',
    sourceOriginal: 'Ad Romanos, IV.1',
    context: '순교를 앞두고 로마 교회에 보낸 편지에서, 자신의 죽음을 성찬 신학으로 해석한 문장. 빵이 곡식에서 빚어지듯 순교자는 고난을 통해 그리스도와 하나가 된다는 역설적 통찰.',
  },
  {
    text: '씨앗으로서의 로고스는 모든 인간 안에 심겨 있다.',
    author: '유스티누스 순교자',
    years: 'c. 100–165',
    source: '제2 호교론',
    sourceOriginal: 'Apologia Secunda, XIII.3',
    context: '로고스 스페르마티코스(logos spermatikos) 개념. 소크라테스와 플라톤도 로고스의 씨앗을 부분적으로 지녔다는 논증으로, 기독교와 철학의 관계를 정립한 초기 변증론의 핵심 명제.',
  },
  {
    text: '하나님의 영광은 완전히 살아있는 인간이며, 인간의 생명은 하나님을 바라보는 것이다.',
    author: '리용의 이레나이우스',
    years: 'c. 130–202',
    source: '이단 반박',
    sourceOriginal: 'Adversus Haereses, IV.20.7',
    context: '영지주의를 논박하며 창조의 선함을 옹호한 대목. "Gloria Dei vivens homo"로 알려진 이 명제는 물질 세계와 육체의 신학적 존엄성을 선언하며, 이레나이우스 신학의 핵심을 압축한다.',
  },
  {
    text: '그리스도인의 피는 씨앗이다.',
    author: '테르툴리아누스',
    years: 'c. 155–220',
    source: '호교론',
    sourceOriginal: 'Apologeticus, L.13',
    context: '박해자들에게 보내는 호교론의 결론부. 순교가 교회를 위축시키기는커녕 성장의 원동력이 된다는 역설을 한 문장으로 압축했다. "Sanguis martyrum semen Ecclesiae"라는 격언의 원형.',
  },
  {
    text: '철학은 그리스인들에게 주어진 언약이었다. 율법이 히브리인들에게 주어진 것처럼.',
    author: '알렉산드리아의 클레멘스',
    years: 'c. 150–215',
    source: '스트로마타',
    sourceOriginal: 'Stromata, I.5.28',
    context: '알렉산드리아 신학의 근본 전제. 이방 철학을 기독교 신앙의 예비 단계로 보는 이 명제는, 신앙과 이성의 종합을 추구한 알렉산드리아 학파 전체의 방향을 규정한다.',
  },
  {
    text: '성경 안에는 문자가 있고, 문자 뒤에는 도덕이 있으며, 도덕 위에는 영이 있다.',
    author: '오리게네스',
    years: 'c. 184–253',
    source: '원리에 대하여',
    sourceOriginal: 'De Principiis, IV.2.4',
    context: '성경의 삼중 의미론을 체계화한 대목. 몸·혼·영이라는 인간 삼분법을 성경 해석에 적용하여, 문자 너머의 영적 의미를 탐구하는 알레고리 해석학의 신학적 근거를 제시한다.',
  },
  {
    text: '교회를 어머니로 삼지 않는 자는 하나님을 아버지로 삼을 수 없다.',
    author: '카르타고의 키프리아누스',
    years: 'c. 200–258',
    source: '교회의 단일성',
    sourceOriginal: 'De Ecclesiae Unitate, VI',
    context: '분리주의자 노바티아누스파를 논박하며 교회 일치의 신학적 필연성을 선언한 문장. 교회론과 구원론을 연결하는 이 명제는 이후 서방 교회 전통에서 가장 자주 인용되는 교회론 명제 중 하나다.',
  },
  {
    text: '하나님의 말씀이 사람이 되신 것은, 우리가 그 안에서 신화(神化)되도록 하시기 위함이다.',
    author: '알렉산드리아의 아타나시우스',
    years: 'c. 296–373',
    source: '말씀의 성육신에 대하여',
    sourceOriginal: 'De Incarnatione, LIV.3',
    context: '테오시스(theosis, 신화) 교리의 가장 명료한 표현. 성육신의 목적을 인간의 신화로 규정한 이 명제는 동방 신학의 구원론적 핵심이며, 아리우스 논쟁에서 그리스도의 완전한 신성이 왜 필수적인지를 설명한다.',
  },
  {
    text: '인간 영혼 안에는 창조될 때부터 하나님을 향한 사랑의 씨앗이 심겨 있다.',
    author: '카이사리아의 바실리우스',
    years: 'c. 329–379',
    source: '도덕 규칙',
    sourceOriginal: 'Regulae Morales, Regula II',
    context: '수도 공동체를 위한 규범집에서, 하나님 사랑이 외부로부터 강제된 의무가 아니라 본성 안에 심겨진 씨앗임을 밝힌 대목. 이는 은혜가 자연을 파괴하지 않고 완성한다는 신학적 인간학의 토대다.',
  },
  {
    text: '신학은 모든 이에게 열려 있지 않다. 그것은 삶으로 정화된 자들의 것이다.',
    author: '나지안주스의 그레고리우스',
    years: 'c. 329–390',
    source: '신학 강론',
    sourceOriginal: 'Theologica Orationes, 27.3',
    context: '아리우스 논쟁으로 소란했던 콘스탄티노폴리스에서 행한 다섯 신학 강론의 첫 문장. 신학적 사유의 전제조건은 학식이 아니라 삶의 정화라는 선언으로, 지식과 거룩함의 통합을 요구한다.',
  },
  {
    text: '하나님을 향해 나아가는 것에는 끝이 없다. 선 자체가 본질적으로 무한하기 때문이다.',
    author: '니사의 그레고리우스',
    years: 'c. 335–395',
    source: '모세의 생애',
    sourceOriginal: 'Vita Moysis, II.239',
    context: '에펙타시스(epektasis) 개념의 핵심 진술. 하나님을 향한 여정은 도달점에서 끝나지 않고 영원히 더 깊이 들어가는 전진이라는 통찰. 빌립보서 3:13의 "앞에 있는 것을 향해 뻗어나감"을 신학적으로 전개한다.',
  },
  {
    text: '성경을 읽을 때 하나님이 우리에게 말씀하시고, 기도할 때 우리가 하나님께 말씀드린다.',
    author: '밀라노의 암브로시우스',
    years: 'c. 339–397',
    source: '성직의 의무',
    sourceOriginal: 'De Officiis Ministrorum, I.20.88',
    context: '성직자 교육을 위해 쓴 윤리 지침서에서, 성경 읽기와 기도의 상호성을 규정한 대목. 이 두 실천을 하나님과의 대화로 이해하는 틀은 이후 렉시오 디비나 전통의 신학적 기초가 된다.',
  },
  {
    text: '그대가 하나님을 섬기고자 한다면, 가난한 자를 섬기는 것부터 시작하라.',
    author: '요한 크리소스토무스',
    years: 'c. 347–407',
    source: '마태복음 강해',
    sourceOriginal: 'In Matthaeum Homiliae, L.4',
    context: '마태복음 25장(최후 심판)을 강해하는 설교에서. 황금 제단을 치장하는 것보다 굶주린 그리스도를 먹이는 것이 우선이라는 도전적 선언으로, 전례와 사회 윤리를 통합하는 크리소스토무스 신학의 정수.',
  },
  {
    text: '성경을 모르는 것은 그리스도를 모르는 것이다.',
    author: '히에로니무스',
    years: 'c. 347–420',
    source: '이사야 주석 서문',
    sourceOriginal: 'Commentarii in Isaiam, Prologus',
    context: '이사야서 방대한 주석을 시작하며 성경 연구의 중요성을 선언한 서문. 라틴 성경 번역(불가타)에 생애를 바친 히에로니무스의 신념을 압축한다. 성경 주석학과 그리스도론이 분리될 수 없음을 선언.',
  },
  {
    text: '우리의 마음은 주님 안에서 쉬기 전까지는 쉬지 못합니다.',
    author: '히포의 아우구스티누스',
    years: '354–430',
    source: '고백록',
    sourceOriginal: 'Confessiones, I.1.1',
    context: '고백록 첫 문장. 하나님을 향한 피조물의 실존적 불안과 귀환 욕구를 압축한 기독교 영성 문학 최고의 명문. 인간의 영혼이 창조주 안에서만 진정한 안식을 찾는다는 아우구스티누스 신학의 출발점.',
  },
  {
    text: '우리는 우리가 사랑하는 것으로 변해간다.',
    author: '히포의 아우구스티누스',
    years: '354–430',
    source: '요한서신 강해',
    sourceOriginal: 'In Epistulam Ioannis ad Parthos, II.14',
    context: '사랑을 다루는 강해에서. 어떤 대상을 향해 의지와 욕망이 흐르느냐에 따라 인격이 형성된다는 아우구스티누스의 의지론적 인간학. 하나님을 사랑하는 것이 곧 하나님을 닮아가는 것이라는 윤리적 함의를 담는다.',
  },
  {
    text: '그리스도인이여, 그대의 존엄성을 기억하라. 그대는 이제 하나님의 본성에 참여하게 되었다.',
    author: '레오 대교황',
    years: 'c. 400–461',
    source: '성탄 설교',
    sourceOriginal: 'Sermo in Nativitate Domini, I.3',
    context: '성탄 설교에서 성육신이 인간 존엄성을 근원적으로 회복시켰다는 선언. 세리스쿠스 목사가 아닌 대중에게 한 이 설교는, 그리스도의 탄생이 곧 새로운 인류의 탄생임을 선포한다.',
  },
  {
    text: '여기에 내가 서 있습니다. 하나님이여, 도와주소서. 나는 달리 할 수 없습니다.',
    author: '마르틴 루터',
    years: '1483–1546',
    source: '보름스 의회 증언',
    sourceOriginal: 'Diet of Worms, 1521',
    context: '황제와 교황의 권위 앞에서 자신의 저작 철회를 거부하며 한 역사적 선언. 양심이 하나님의 말씀에 사로잡혀 있는 한 물러설 수 없다는 고백으로, 종교개혁의 분수령이 된 순간을 담는다.',
  },
  {
    text: '율법은 우리를 그리스도에게로 몰아가며, 복음은 우리를 그리스도 안으로 이끈다.',
    author: '마르틴 루터',
    years: '1483–1546',
    source: '갈라디아서 강해',
    sourceOriginal: 'In Epistulam ad Galatas Commentarius, 1535',
    context: '루터 신학의 핵심인 율법과 복음의 변증법을 압축한 명제. 율법은 죄를 드러내어 인간을 절망으로 이끌고, 복음은 그 자리에서 그리스도를 가리킨다는 구조는 루터 설교학 전체의 뼈대다.',
  },
  {
    text: '그리스도를 아는 것은 그분의 은덕(beneficia)을 아는 것이다.',
    author: '필리프 멜란히톤',
    years: '1497–1560',
    source: '신학개요',
    sourceOriginal: 'Loci Communes, Praefatio, 1521',
    context: '종교개혁 최초의 조직신학 서문에서, 그리스도론의 중심을 사변이 아닌 구원론에 두겠다는 선언. 삼위일체의 본질보다 하나님이 우리를 위해 무엇을 하셨는가를 묻는 개신교 신학의 방향을 규정한다.',
  },
  {
    text: '하나님의 말씀은 영원하고 확실하다. 그것은 어떠한 인간의 주장과도 타협하지 않는다.',
    author: '울리히 츠빙글리',
    years: '1484–1531',
    source: '67개 조항',
    sourceOriginal: '67 Conclusiones, I, 1523',
    context: '취리히 대논쟁을 위해 작성한 67개 조항의 첫 번째. 성경의 권위를 모든 개혁의 유일한 근거로 삼는다는 선언으로, 스위스 개혁교회가 로마와 루터파 양쪽과 구분되는 지점을 표시한다.',
  },
  {
    text: '하나님의 말씀이 없으면 인간의 모든 종교는 거짓 신들을 향한 방황이다.',
    author: '장 칼뱅',
    years: '1509–1564',
    source: '기독교 강요',
    sourceOriginal: 'Institutio Christianae Religionis, I.6.3, 1559',
    context: '자연 계시의 한계를 논하는 대목. 타락 이후 인간의 인식 능력은 손상되었기에, 성경이 하나님을 바로 알기 위한 "안경"(spectacles)으로 필요하다는 칼뱅의 핵심 인식론.',
  },
  {
    text: '하나님의 주권적 선택이 없다면, 우리 중 누가 구원에 이를 수 있겠는가.',
    author: '장 칼뱅',
    years: '1509–1564',
    source: '기독교 강요',
    sourceOriginal: 'Institutio Christianae Religionis, III.21.1, 1559',
    context: '예정론을 다루는 장의 도입부. 이 교리를 오만한 사변이 아니라 구원의 확신과 하나님 찬양의 근거로 제시한다. 칼뱅에게 예정론은 공포가 아니라 위로의 교리다.',
  },
  {
    text: '그리스도의 교회는 세상의 박해가 아니라 세상과의 타협으로 멸망한다.',
    author: '존 녹스',
    years: '1514–1572',
    source: '스코틀랜드 종교개혁의 역사',
    sourceOriginal: 'The History of the Reformation in Scotland, 1559',
    context: '가톨릭 세력과 타협을 요구받던 스코틀랜드 개혁교회를 향한 권면. 순교는 이길 수 없지만 세속화는 교회를 안으로 무너뜨린다는 예언자적 경고.',
  },
  {
    text: '복음은 단순히 말로 선포될 뿐 아니라 성례전을 통해 가시적으로 선포된다.',
    author: '마르틴 부처',
    years: '1491–1551',
    source: '교회의 참된 치유에 대하여',
    sourceOriginal: 'Von der wahren Seelsorge, 1538',
    context: '목회 신학의 고전으로 꼽히는 이 저작에서 선포와 성례전의 통일성을 논한 대목. 목회를 설교와 성례전, 공동체적 돌봄의 통합으로 이해하는 부처 목회 신학의 핵심 명제.',
  },
];

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((date.getTime() - start.getTime()) / 86400000);
}

export function getDailyQuote(): PatristicQuote {
  const index = getDayOfYear(new Date()) % PATRISTIC_QUOTES.length;
  return PATRISTIC_QUOTES[index];
}
