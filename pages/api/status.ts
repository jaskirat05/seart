import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabaseAdmin';
import type { GenerationStatus } from '@/types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Disable caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { generationId } = req.query;

    if (!generationId || typeof generationId !== 'string') {
        return res.status(400).json({ error: 'Generation ID is required' });
    }

    try {
        const { data: generation, error } = await supabaseAdmin
            .from('image_generations')
            .select('*')
            .eq('id', generationId)
            .single();

        if (error) {
            console.error('Error fetching generation:', error);
            return res.status(500).json({ error: 'Failed to fetch generation status' });
        }

        if (!generation) {
            return res.status(404).json({ error: 'Generation not found' });
        }

        // Map the status and include the image URL if available
        const response: {
            status: GenerationStatus;
            imageUrl?: string;
        } = {
            status: generation.status,
        };

        // If the generation is complete, include the image URL
        if (generation.status === 'completed' && generation.image_url) {
            response.imageUrl = generation.image_url;
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
