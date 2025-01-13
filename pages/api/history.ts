import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabase';
import {getAuth} from "@clerk/nextjs/server";


const PAGE_SIZE = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set cache control headers for browser caching
  
  console.log('History API called');
  


  try {
    const client = await getAuth(req);
    const userId = await client.userId;

    const sessionId = req.headers['x-session-id'] as string | undefined;

    const page = req.query.page || 1;
    console.log('Raw query params:', req.query);

    console.log('Parsed params:', { userId, sessionId, page });

    // Input validation
    if (!userId && !sessionId) {
      console.log('No userId or sessionId provided');
      return res.status(400).json({
        message: 'Either userId or sessionId is required',
        receivedParams: req.query
      });
    }

    // First, let's try a simple count query
    let countQuery = supabase
      .from('image_generations')
      .select('*', { count: 'exact', head: true });

    if (userId) {
      countQuery = countQuery.eq('clerk_id', userId);
    } else if (sessionId) {
      countQuery = countQuery.eq('session_id', sessionId);
    }

    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Count query error:', countError);
      throw countError;
    }

    console.log('Total count:', count);

    // If we have no records, return early
    if (count === 0) {
      return res.status(200).json({
        data: [],
        totalCount: 0,
        hasMore: false
      });
    }

    // Calculate pagination
    const currentPage = Math.max(1, parseInt(page as string, 10));
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    console.log('Pagination:', { currentPage, from, to });

    // Now fetch the actual data
    let dataQuery = supabase
      .from('image_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (userId) {
      console.log('Querying by userId:', userId);
      dataQuery = dataQuery.eq('clerk_id', userId);
    } else if (sessionId && typeof sessionId === 'string') {
      console.log('Querying by sessionId:', sessionId);
      dataQuery = dataQuery.eq('session_id', sessionId);
    }

    console.log('Executing data query...');
    const { data, error: dataError } = await dataQuery;

    if (dataError) {
      console.error('Data query error:', dataError);
      throw dataError;
    }

    if (!data) {
      return res.status(200).json({
        data: [],
        totalCount: count,
        hasMore: false
      });
    }

    console.log('Query successful, returning', data.length, 'items');

    return res.status(200).json({
      data,
      totalCount: count,
      hasMore: (from + data.length) < count!
    });

  } catch (error) {
    console.error('Error in history API:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}