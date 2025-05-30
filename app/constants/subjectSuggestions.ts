import { SubjectSuggestion } from '../types';

export const SUBJECT_SUGGESTIONS: SubjectSuggestion[] = [
    // 动物类 - 按照 API 建议优化
    {
        id: 'cat-1',
        category: '可爱动物',
        description: '橘色小猫咪',
        example: '一只圆润胖嘟嘟的橘色小猫咪，头上戴着蓝色丝绸蝴蝶结，坐在简洁背景中，毛发蓬松柔软质感，黑色大眼睛，粉色小鼻子'
    },
    {
        id: 'dog-1',
        category: '可爱动物',
        description: '金毛狗狗',
        example: '一只温顺的金毛狗狗，金黄色长毛发，耳朵自然垂下，黑色湿润鼻头，友善的棕色眼睛，坐姿端正，简洁背景，毛发质感细腻'
    },
    {
        id: 'panda-1',
        category: '可爱动物',
        description: '熊猫宝宝',
        example: '一只圆滚滚的熊猫宝宝，黑白分明的毛色，圆圆的黑眼圈，小巧的黑鼻子，胖嘟嘟的身材，坐在竹林背景中，毛发蓬松质感'
    },
    {
        id: 'rabbit-1',
        category: '可爱动物',
        description: '白色兔子',
        example: '一只纯白色长耳朵兔子，竖直的长耳朵，粉色内耳，红色圆眼睛，粉色三瓣嘴，蓬松的白色毛发，坐在草地上，毛发柔软质感'
    },

    // 人物类
    {
        id: 'girl-1',
        category: '卡通人物',
        description: '可爱女孩',
        example: '一个可爱的卡通小女孩，双马尾发型，大大的圆眼睛，粉色连衣裙，甜美笑容，Q版比例，简洁背景，柔和光线'
    },
    {
        id: 'boy-1',
        category: '卡通人物',
        description: '帅气男孩',
        example: '一个帅气的卡通小男孩，短发造型，明亮的眼睛，蓝色T恤，自信表情，Q版身材比例，简洁背景，清爽感觉'
    },
    {
        id: 'office-1',
        category: '职场人物',
        description: '上班族',
        example: '一个职场上班族，穿着整洁的白色衬衫，戴着黑框眼镜，整齐的发型，专业形象，办公室背景'
    },
    {
        id: 'student-1',
        category: '校园人物',
        description: '学生',
        example: '一个青春活力的学生，背着书包，穿着校服，年轻朝气的面容，校园背景，充满活力的姿态'
    },

    // 奇幻类
    {
        id: 'dragon-1',
        category: '奇幻生物',
        description: 'Q版小龙',
        example: '一只Q版可爱小龙，绿色鳞片质感，圆润身材，小翅膀，会喷彩色火焰，友善表情，奇幻背景，魔法氛围'
    },
    {
        id: 'unicorn-1',
        category: '奇幻生物',
        description: '独角兽',
        example: '一只纯白色独角兽，银色螺旋独角，彩虹色鬃毛飘逸，蓝色大眼睛，身体散发柔和光芒，梦幻背景'
    },

    // 食物类
    {
        id: 'dumpling-1',
        category: '美食角色',
        description: '包子君',
        example: '一个白胖胖的小包子，圆润饱满的身材，顶部有褶皱纹理，可爱的五官表情，蒸汽环绕，温暖的厨房背景'
    },
    {
        id: 'toast-1',
        category: '美食角色',
        description: '吐司君',
        example: '一片金黄色吐司，方形身材，表面涂着红色果酱，焦糖色烘烤纹理，香甜表情，厨房背景，温馨氛围'
    },

    // 物品类
    {
        id: 'cactus-1',
        category: '植物角色',
        description: '仙人掌君',
        example: '一盆绿色仙人掌，圆润多肉质感，顶部戴着红色小帽子，小刺突出，花盆中生长，沙漠背景'
    },
    {
        id: 'mushroom-1',
        category: '植物角色',
        description: '蘑菇君',
        example: '一朵红白相间的小蘑菇，圆形菌盖，白色斑点，细长菌柄，森林背景，柔和光线'
    },

    // 职业类
    {
        id: 'doctor-1',
        category: '职业人物',
        description: '医生',
        example: '一位专业医生，男生，穿着白色大褂，戴着听诊器，温和表情，医院背景，专业可信赖的形象'
    },
    {
        id: 'chef-1',
        category: '职业人物',
        description: '厨师',
        example: '一位厨师，女生，戴着白色厨师帽，穿着围裙，手拿锅铲，自信表情，厨房背景，专业厨具环绕，温暖氛围'
    },

    // 机器人类
    {
        id: 'robot-1',
        category: '科技角色',
        description: '机器人',
        example: '一个圆头圆脑的小机器人，蓝白配色，LED眼睛发光，金属质感外壳，科技线条设计，未来科技背景'
    },
    {
        id: 'alien-1',
        category: '科技角色',
        description: '外星人',
        example: '一个绿色小外星人，大大的黑眼睛，光滑的皮肤，细长身材，友好表情，UFO背景，科幻氛围'
    },

    // 季节类
    {
        id: 'snowman-1',
        category: '季节角色',
        description: '雪人',
        example: '一个三层雪球堆成的雪人，戴着红色围巾和黑色帽子，胡萝卜鼻子，煤球眼睛，雪花飘落背景，冬日氛围'
    },
    {
        id: 'sunflower-1',
        category: '季节角色',
        description: '向日葵',
        example: '一朵大大的向日葵，金黄色花瓣，黑色花心，绿色茎叶，面向阳光，蓝天白云背景，夏日温暖氛围'
    }
];

// 随机获取建议
export function getRandomSuggestions(count: number = 6): SubjectSuggestion[] {
    const shuffled = [...SUBJECT_SUGGESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 按分类获取建议
export function getSuggestionsByCategory(category: string): SubjectSuggestion[] {
    return SUBJECT_SUGGESTIONS.filter(s => s.category === category);
} 